function getCurrentUser() {
    return JSON.parse(localStorage.getItem('cinetech_currentUser'));
}
function requireAuth() {
    const isProtectedPage = window.location.pathname.includes('admin.html');
    if (isProtectedPage && !getCurrentUser()) {
        window.location.href = 'index.html';
    }
}
function getGlobalRatings() {
    return JSON.parse(localStorage.getItem('cinetech_global_ratings')) || {};
}
function saveGlobalRatings(ratings) {
    localStorage.setItem('cinetech_global_ratings', JSON.stringify(ratings));
}
function getAverageRating(filmId) {
    const allRatings = getGlobalRatings();
    const filmRatings = allRatings[filmId];
    if (!filmRatings) {
        const film = films.find(f => f.id === filmId);
        return film ? parseFloat(film.rating || 0) : 0;
    }
    const scores = Object.values(filmRatings);
    const sum = scores.reduce((a, b) => a + b, 0);
    return parseFloat((sum / scores.length).toFixed(1));
}
function getUserRating(filmId) {
    const user = getCurrentUser();
    if (!user) return 0;
    const allRatings = getGlobalRatings();
    return allRatings[filmId] ? allRatings[filmId][user.id] || 0 : 0;
}
function favKey() {
    const user = getCurrentUser();
    return user ? `cinetech_favs_${user.username.toLowerCase()}` : null;
}
function getFavorites() {
    const key = favKey();
    return key ? JSON.parse(localStorage.getItem(key)) || [] : [];
}
function saveFavorites(favs) {
    const key = favKey();
    if (key) localStorage.setItem(key, JSON.stringify(favs));
}
function initUserStorage() {
    const key = favKey();
    if (key && !localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
    }
}
let localFilms = JSON.parse(localStorage.getItem('cinetech_films')) || [];
let films = [...localFilms];
async function fetchFilmsFromAPI() {
    const apiURL = 'https://jsonfakery.com/movies/paginated';
    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        const apiFilms = result.data.map(m => ({
            id: m.id,
            title: m.original_title,
            poster: m.poster_path,
            year: m.release_date ? m.release_date.split('/').pop() : 'N/A',
            genre: 'Action/Drama',
            director: m.casts && m.casts.length > 0 ? m.casts[0].name : 'Unknown',
            rating: m.vote_average,
            overview: m.overview,
            isExternal: true
        }));
        films = [...localFilms, ...apiFilms];
        renderCatalog();
        renderFavorites();
        if (document.getElementById('section-films')) renderAdminFilms();
    } catch (error) {
        console.warn("Fetch failed, using ONLY local films:", error);
        films = [...localFilms];
        renderCatalog();
        renderFavorites();
        if (document.getElementById('section-films')) renderAdminFilms();
    }
}
function saveFilms() {
    localStorage.setItem('cinetech_films', JSON.stringify(localFilms));
}

function renderAdminFilms() {
    const tbody = document.getElementById('films-table-body');
    if (!tbody) return;

    tbody.innerHTML = "";

    films.forEach(film => {
        tbody.innerHTML += `
        <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td class="p-3"><img src="${film.poster}" class="w-10 h-14 object-cover rounded shadow-sm" onerror="this.src='https://via.placeholder.com/100x150?text=X'"></td>
            <td class="p-3 font-medium text-gray-900">${film.title}</td>
            <td class="p-3 text-gray-500">${film.director}</td>
            <td class="p-3 text-gray-500">${film.year}</td>
            <td class="p-3 text-gray-500">${film.genre}</td>
            <td class="p-3 text-blue-600 font-bold">★ ${getAverageRating(film.id)}</td>
            <td class="p-3">
                <span class="text-xs px-2 py-1 rounded ${film.isExternal ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} font-bold">
                    ${film.isExternal ? 'API' : 'LOCAL'}
                </span>
            </td>
            <td class="p-3 text-center">
                ${film.isExternal ? '<span class="text-gray-300">-</span>' : `
                <div class="flex justify-center gap-1">
                    <button onclick="editFilm('${film.id}')" class="text-blue-400 hover:text-blue-600 p-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteFilm('${film.id}')" class="text-red-400 hover:text-red-600 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                `}
            </td>
        </tr>
        `;
    });
}

function renderAdminDashboard() {
    const kpiFilms = document.getElementById('kpi-total-films');
    const kpiDirectors = document.getElementById('kpi-total-directors');
    const kpiRating = document.getElementById('kpi-avg-rating');

    if (!kpiFilms) return;

    kpiFilms.innerText = localFilms.length;

    const uniqueDirectors = [...new Set(localFilms.map(f => f.director))];
    kpiDirectors.innerText = uniqueDirectors.length;

    if (localFilms.length > 0) {
        const totalAvg = localFilms.reduce((sum, f) => sum + getAverageRating(f.id), 0);
        const finalAvg = (totalAvg / localFilms.length).toFixed(1);
        kpiRating.innerText = `${finalAvg} / 10`;
    } else {
        kpiRating.innerText = "0 / 10";
    }

    const ctx = document.getElementById('myChart');
    if (ctx) {
        if (window.adminChart) {
            window.adminChart.destroy();
        }

        const genreCounts = {};
        localFilms.forEach(f => {
            genreCounts[f.genre] = (genreCounts[f.genre] || 0) + 1;
        });

        const labels = Object.keys(genreCounts);
        const data = Object.values(genreCounts);

        window.adminChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Films par Genre (Local)',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}

function openFilmModal() {
    const modal = document.getElementById('film-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function prepareAddFilm() {
    document.getElementById('modal-title').innerText = "Ajouter un Film";
    document.getElementById('film-form').reset();
    document.getElementById('film-id').value = "";
    document.getElementById('film-rating').value = 0;
    openFilmModal();
}

window.prepareAddFilm = prepareAddFilm;

function closeFilmModal() {
    const modal = document.getElementById('film-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function deleteFilm(id) {
    if (!confirm("Supprimer ce film local ?")) return;
    localFilms = localFilms.filter(f => f.id != id);
    films = films.filter(f => f.id != id);
    saveFilms();
    renderAdminFilms();
    renderCatalog();
    renderAdminDashboard();
}

window.openFilmModal = openFilmModal;
window.closeFilmModal = closeFilmModal;
window.deleteFilm = deleteFilm;

function toggleFavorite(filmId) {
    const user = getCurrentUser();
    if (!user) {
        if (typeof openLoginModal === 'function') {
            openLoginModal();
        } else {
            alert("Veuillez vous connecter pour ajouter des favoris.");
            window.location.href = 'index.html';
        }
        return;
    }
    const favs = getFavorites();
    const index = favs.indexOf(filmId);

    if (index === -1) {
        favs.push(filmId);
    } else {
        favs.splice(index, 1);
    }

    saveFavorites(favs);
    renderCatalog();
    renderFavorites();
}

function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (films.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i><p class="mt-2 text-gray-500">Chargement des films...</p></div>';
        return;
    }

    const favs = getFavorites();
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';
    grid.innerHTML = "";

    films.forEach(film => {
        const isFav = favs.includes(film.id);
        const avgRating = getAverageRating(film.id);

        grid.innerHTML += `
        <div onclick="showMovieDetail('${film.id}')" class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 relative cursor-pointer">
            <div class="relative overflow-hidden aspect-[2/3]">
                <img src="${film.poster}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                     <p class="text-white text-xs line-clamp-3">${film.overview || ''}</p>
                </div>
                ${!isAdmin ? `
                <button onclick="event.stopPropagation(); toggleFavorite('${film.id}')"
                    class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition-all hover:scale-110 hover:bg-white active:scale-95 z-10">
                    <i class="${isFav ? 'fas text-red-500' : 'far text-gray-400'} fa-heart"></i>
                </button>
                ` : ''}
            </div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-gray-900 truncate flex-1 pr-2">${film.title}</h4>
                    <span class="text-blue-600 font-semibold text-sm">★ ${avgRating}</span>
                </div>
                <p class="text-[11px] font-bold text-blue-500/80 uppercase mb-1">${film.director}</p>
                <p class="text-xs text-gray-500">${film.genre} • ${film.year}</p>
            </div>
        </div>
        `;
    });
}

function renderFavorites() {
    const tbody = document.getElementById('favs-table-body');
    if (!tbody) return;

    const favIds = getFavorites();
    const favFilms = films.filter(f => favIds.includes(f.id));

    tbody.innerHTML = "";

    if (favFilms.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-400">
                    <div class="flex flex-col items-center">
                        <i class="far fa-heart text-4xl mb-2 opacity-20"></i>
                        <p>Aucun film favori pour le moment</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    favFilms.forEach(film => {
        tbody.innerHTML += `
        <tr onclick="showMovieDetail('${film.id}')" class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
            <td class="p-3"><img src="${film.poster}" class="w-12 h-16 object-cover rounded shadow-sm group-hover:scale-105 transition-transform" onerror="this.src='https://via.placeholder.com/100x150?text=X'"></td>
            <td class="p-3 font-medium text-gray-900">${film.title}</td>
            <td class="p-3 text-gray-600">${film.director}</td>
            <td class="p-3 text-gray-600">${film.year}</td>
            <td class="p-3"><span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full uppercase font-bold">${film.genre}</span></td>
            <td class="p-3"><span class="font-semibold text-blue-600">★ ${film.rating}</span></td>
            <td class="p-3 text-center" onclick="event.stopPropagation()">
                <button onclick="toggleFavorite('${film.id}')"
                    class="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                    title="Retirer des favoris">
                    <i class="fas fa-trash-alt text-sm"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function showMovieDetail(id) {
    const film = films.find(f => f.id === id);
    if (!film) return;

    const modal = document.getElementById('movie-detail-modal');
    const content = document.getElementById('movie-detail-content');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="md:w-1/3">
            <img src="${film.poster}" class="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" onerror="this.src='https://via.placeholder.com/400x600?text=No+Poster'">
        </div>
        <div class="md:w-2/3 p-8 flex flex-col justify-center">
            <div class="mb-4">
                <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold uppercase tracking-wider">${film.genre}</span>
                <span class="ml-3 text-gray-400 font-medium">${film.year}</span>
            </div>
            <h2 class="text-4xl font-black text-gray-900 mb-2">${film.title}</h2>
            <p class="text-blue-600 font-bold mb-2 flex items-center gap-2">
                <i class="fas fa-star text-yellow-500"></i> Note Moyenne: <span id="detail-rating-value">${getAverageRating(film.id)}</span> / 10
            </p>
            
            <!-- Star Rating System -->
            <div class="flex items-center gap-1 mb-6" id="star-rating-container">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Votre Note :</span>
                <div class="flex flex-row-reverse">
                    ${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(i => {
        const userScore = getUserRating(film.id);
        return `
                        <input type="radio" id="star${i}-${film.id}" name="rating" value="${i}" class="hidden peer" ${Math.round(userScore) === i ? 'checked' : ''} />
                        <label for="star${i}-${film.id}" onclick="rateMovie('${film.id}', ${i})" class="cursor-pointer text-slate-200 peer-hover:text-yellow-400 peer-checked:text-yellow-500 hover:scale-125 transition-all px-0.5">
                            <i class="fas fa-star text-base"></i>
                        </label>
                    `;
    }).join('')}
                </div>
            </div>

            <div class="space-y-4 mb-8">
                <div>
                    <h4 class="text-xs uppercase font-bold text-gray-400 mb-1">Résumé</h4>
                    <p class="text-gray-600 leading-relaxed">${film.overview || "Aucun résumé disponible pour ce film."}</p>
                </div>
                <div>
                    <h4 class="text-xs uppercase font-bold text-gray-400 mb-1">Réalisateur</h4>
                    <p class="text-gray-800 font-semibold">${film.director || 'Inconnu'}</p>
                </div>
            </div>
            <div class="mt-auto flex gap-4">
                 <button onclick="toggleFavorite('${film.id}'); closeMovieDetail()" class="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Ajouter aux Favoris
                 </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function rateMovie(id, score) {
    const user = getCurrentUser();
    if (!user) {
        if (typeof window.openLoginModal === 'function') window.openLoginModal();
        return;
    }

    const allRatings = getGlobalRatings();
    if (!allRatings[id]) allRatings[id] = {};
    allRatings[id][user.id] = score;
    saveGlobalRatings(allRatings);

    const ratingLabel = document.getElementById('detail-rating-value');
    if (ratingLabel) ratingLabel.innerText = getAverageRating(id);

    renderCatalog();
    renderFavorites();
    renderAdminFilms();
    if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
}

window.rateMovie = rateMovie;

function closeMovieDetail() {
    const modal = document.getElementById('movie-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    const users = JSON.parse(localStorage.getItem('cinetech_users')) || [];
    const currentAdmin = getCurrentUser();

    tbody.innerHTML = "";

    users.forEach(user => {
        const isSelf = currentAdmin && user.username === currentAdmin.username;

        tbody.innerHTML += `
        <tr class="border-b border-gray-100 hover:bg-slate-50 transition-colors">
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="font-bold text-gray-900">${user.username} ${isSelf ? '<span class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-400 ml-2 font-normal">Vous</span>' : ''}</p>
                        <p class="text-xs text-gray-400">ID: ${user.id}</p>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <select onchange="updateUserRole(${user.id}, this.value)" 
                        ${isSelf ? 'disabled' : ''}
                        class="bg-white border rounded px-2 py-1 text-sm ${user.role === 'admin' ? 'text-purple-600 font-bold' : 'text-blue-600'}">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>Utilisateur</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td class="p-4 text-gray-500">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Ancien compte'}</td>
            <td class="p-4 text-center">
                ${isSelf ? '-' : `
                <button onclick="deleteUser(${user.id})" class="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto">
                    <i class="fas fa-trash-alt"></i>
                </button>
                `}
            </td>
        </tr>
        `;
    });
}

function updateUserRole(id, newRole) {
    let users = JSON.parse(localStorage.getItem('cinetech_users')) || [];
    const idx = users.findIndex(u => u.id == id);
    if (idx > -1) {
        users[idx].role = newRole;
        localStorage.setItem('cinetech_users', JSON.stringify(users));
        console.log(`Rôle de l'utilisateur ${id} mis à jour en ${newRole}`);
    }
}

function deleteUser(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

    let users = JSON.parse(localStorage.getItem('cinetech_users')) || [];
    const newUsers = users.filter(u => u.id != id);
    localStorage.setItem('cinetech_users', JSON.stringify(newUsers));
    renderUsers();
}

function navigateTo(section) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(`section-${section}`);
    if (targetSection) targetSection.classList.remove('hidden');

    const titleEl = document.getElementById('page-title');
    if (titleEl) {
        const titles = {
            dashboard: "Tableau de bord",
            films: "Gestion des Films",
            directors: "Gestion des Réalisateurs",
            catalog: "Catalogue de Films",
            favorites: "Mes Favoris",
            users: "Gestion Utilisateurs"
        };
        titleEl.innerText = titles[section] || "CineTech";
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-blue-600', 'text-white');
        link.classList.add('text-slate-300', 'hover:bg-slate-800');
    });
    const activeLink = document.getElementById(`nav-${section}`);
    if (activeLink) {
        activeLink.classList.add('bg-blue-600', 'text-white');
        activeLink.classList.remove('text-slate-300', 'hover:bg-slate-800');
    }

    if (section === 'users') renderUsers();
    if (section === 'films') renderAdminFilms();
    if (section === 'directors') renderDirectors();
    if (section === 'dashboard') renderAdminDashboard();
}

function renderDirectors() {
    const list = document.getElementById('directors-list');
    if (!list) return;

    const directorsMap = {};
    localFilms.forEach(f => {
        if (!directorsMap[f.director]) {
            directorsMap[f.director] = 0;
        }
        directorsMap[f.director]++;
    });

    const directorNames = Object.keys(directorsMap);

    if (directorNames.length === 0) {
        list.innerHTML = `
            <div class="col-span-full p-8 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center">
                <i class="fas fa-user-tie text-4xl text-gray-200 mb-3"></i>
                <p class="text-gray-500">Aucun réalisateur trouvé dans vos films locaux.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = "";
    directorNames.forEach(name => {
        const count = directorsMap[name];
        list.innerHTML += `
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    ${name.charAt(0).toUpperCase()}
                </div>
                <div class="cursor-pointer" onclick="openDirectorModal('${name.replace(/'/g, "\\'")}')">
                    <h4 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">${name}</h4>
                    <p class="text-xs text-gray-400 font-medium uppercase">${count} Film${count > 1 ? 's' : ''} local</p>
                </div>
            </div>
            <div class="flex gap-1">
                <button onclick="openDirectorModal('${name.replace(/'/g, "\\'")}')" 
                    class="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-blue-500 hover:text-white">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDirector('${name.replace(/'/g, "\\'")}')" 
                    class="w-9 h-9 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        `;
    });
}

function openDirectorModal(name) {
    const modal = document.getElementById('director-modal');
    if (!modal) return;
    document.getElementById('old-director-name').value = name;
    document.getElementById('new-director-name').value = name;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDirectorModal() {
    const modal = document.getElementById('director-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

window.openDirectorModal = openDirectorModal;
window.closeDirectorModal = closeDirectorModal;

function editFilm(id) {
    const film = localFilms.find(f => f.id === id);
    if (!film) return;

    document.getElementById('modal-title').innerText = "Modifier le Film";
    document.getElementById('film-id').value = film.id;
    document.getElementById('film-title').value = film.title;
    document.getElementById('film-director').value = film.director;
    document.getElementById('film-year').value = film.year;
    document.getElementById('film-genre').value = film.genre;
    document.getElementById('film-rating').value = film.rating || 0;
    document.getElementById('film-poster').value = film.poster.includes('placeholder') ? "" : film.poster;

    openFilmModal();
}

window.editFilm = editFilm;

function deleteDirector(name) {
    if (!confirm(`TÊTES-VOUS SÛR ? Supprimer le réalisateur "${name}" supprimera également TOUS ses films associés de votre catalogue local.`)) return;

    localFilms = localFilms.filter(f => f.director !== name);
    films = films.filter(f => f.director !== name);

    saveFilms();
    renderDirectors();
    renderCatalog();
    renderAdminFilms();
    renderAdminDashboard();
}

window.deleteDirector = deleteDirector;

async function initUsers() {
    try {
        const response = await fetch('users.json');
        if (!response.ok) throw new Error('Could not fetch users.json');
        const jsonUsers = await response.json();

        let localUsers = JSON.parse(localStorage.getItem('cinetech_users')) || [];

        let updated = false;
        jsonUsers.forEach(jsonUser => {
            const exists = localUsers.find(u => u.username.toLowerCase() === jsonUser.username.toLowerCase());
            if (!exists) {
                if (!jsonUser.createdAt) jsonUser.createdAt = new Date().toISOString();
                localUsers.push(jsonUser);
                updated = true;
            }
        });

        if (updated || !localStorage.getItem('cinetech_users')) {
            localStorage.setItem('cinetech_users', JSON.stringify(localUsers));
        }
    } catch (error) {
        console.warn("Manual users sync failed:", error);
        if (!localStorage.getItem('cinetech_users')) {
            const defaults = [
                { id: 1, username: 'admin', role: 'admin', password: 'admin', createdAt: new Date().toISOString() },
                { id: 2, username: 'user', role: 'user', password: 'user', createdAt: new Date().toISOString() }
            ];
            localStorage.setItem('cinetech_users', JSON.stringify(defaults));
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initUsers();
    requireAuth();
    initUserStorage();

    renderCatalog();
    renderFavorites();

    const user = getCurrentUser();
    if (user && user.role === 'admin') {
        navigateTo('dashboard');
    } else {
        navigateTo('catalog');
    }

    fetchFilmsFromAPI();

    const navItems = ['catalog', 'favs', 'dashboard', 'films', 'directors', 'users'];
    navItems.forEach(item => {
        const el = document.getElementById(`nav-${item}`);
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(item === 'favs' ? 'favorites' : item);
            });
        }
    });

    const filmForm = document.getElementById('film-form');
    if (filmForm) {
        filmForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('film-id').value;
            const customPoster = document.getElementById('film-poster').value;

            const filmData = {
                title: document.getElementById('film-title').value,
                director: document.getElementById('film-director').value,
                year: document.getElementById('film-year').value,
                genre: document.getElementById('film-genre').value,
                poster: customPoster || `https://via.placeholder.com/300x450?text=${encodeURIComponent(document.getElementById('film-title').value)}`,
                rating: parseFloat(document.getElementById('film-rating').value) || 0,
                isExternal: false
            };

            if (id) {
                const idx = localFilms.findIndex(f => f.id === id);
                if (idx !== -1) {
                    localFilms[idx] = { ...localFilms[idx], ...filmData };
                    const mainIdx = films.findIndex(f => f.id === id);
                    if (mainIdx !== -1) films[mainIdx] = localFilms[idx];
                }
            } else {
                const newFilm = { id: Date.now().toString(), ...filmData };
                localFilms.unshift(newFilm);
                films.unshift(newFilm);
            }

            saveFilms();
            closeFilmModal();
            renderAdminFilms();
            renderCatalog();
            renderAdminDashboard();
        });
    }

    const directorForm = document.getElementById('director-form');
    if (directorForm) {
        directorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const oldName = document.getElementById('old-director-name').value;
            const newName = document.getElementById('new-director-name').value.trim();

            if (oldName && newName && oldName !== newName) {
                localFilms.forEach(f => {
                    if (f.director === oldName) f.director = newName;
                });
                films.forEach(f => {
                    if (f.director === oldName) f.director = newName;
                });
                saveFilms();
                renderDirectors();
                renderAdminFilms();
                renderCatalog();
            }
            closeDirectorModal();
        });
    }

    const adminSearchInputs = [
        { id: 'search-film', section: 'films' },
        { id: 'catalog-search', section: 'catalog' },
        { id: 'favs-search', section: 'favorites' },
        { id: 'search-director', section: 'directors' },
        { id: 'search-user', section: 'users' }
    ];

    adminSearchInputs.forEach(config => {
        const input = document.getElementById(config.id);
        if (input) {
            input.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();

                if (config.section === 'catalog' || config.section === 'favorites') {
                    const selector = config.section === 'catalog' ? '#catalog-grid > div' : '#favs-table-body tr';
                    const items = document.querySelectorAll(selector);
                    items.forEach(item => {
                        const text = item.innerText.toLowerCase();
                        item.style.display = text.includes(term) ? '' : 'none';
                    });
                } else if (config.section === 'films') {
                    const rows = document.querySelectorAll('#films-table-body tr');
                    rows.forEach(row => {
                        // Check title, director, or genre
                        const text = row.innerText.toLowerCase();
                        row.style.display = text.includes(term) ? '' : 'none';
                    });
                } else if (config.section === 'directors') {
                    const cards = document.querySelectorAll('#directors-list > div');
                    cards.forEach(card => {
                        const name = card.querySelector('h4')?.innerText.toLowerCase() || "";
                        card.style.display = name.includes(term) ? '' : 'none';
                    });
                } else if (config.section === 'users') {
                    const rows = document.querySelectorAll('#users-table-body tr');
                    rows.forEach(row => {
                        const text = row.innerText.toLowerCase();
                        row.style.display = text.includes(term) ? '' : 'none';
                    });
                }
            });
        }
    });
});
