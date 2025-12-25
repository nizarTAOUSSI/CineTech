
window.addEventListener('error', function(e){
    console.error('Global JS error (script.js):', e.message, 'at', e.filename + ':' + e.lineno);
});
let directors = JSON.parse(localStorage.getItem('cinetech_directors')) || [
    { id: 1, name: "Christopher Nolan" }, { id: 2, name: "Quentin Tarantino" }
];
let films = JSON.parse(localStorage.getItem('cinetech_films')) || [];
let apiFilmsLoaded = false;

const genreMap = {
    28: "Action",
    12: "Aventure",
    16: "Animation",
    35: "Comédie",
    80: "Policier",
    99: "Documentaire",
    18: "Drame",
    10751: "Familial",
    14: "Fantastique",
    36: "Histoire",
    27: "Horreur",
    10402: "Musique",
    9648: "Mystère",
    10749: "Romance",
    878: "Science-Fiction",
    10770: "Téléfilm",
    53: "Thriller",
    10752: "Guerre",
    37: "Western"
};

async function fetchFilmsFromAPI() {
    try {
        const response = await fetch('https://jsonfakery.com/movies/paginated');
        const data = await response.json();
        
        if (data && data.data && Array.isArray(data.data)) {
            const apiFilms = data.data.map((movie, index) => {
                const genreId = movie.genre_ids && movie.genre_ids.length > 0 ? movie.genre_ids[0] : null;
                const genre = genreId ? (genreMap[genreId] || "Autre") : "Autre";
                
                const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 2020;
                
                let directorId = directors[0]?.id || 1;
                
                return {
                    id: movie.movie_id || movie.id || Date.now() + index,
                    title: movie.original_title || movie.title || "Sans titre",
                    directorId: directorId,
                    year: year,
                    genre: genre,
                    rating: movie.vote_average || 0,
                    poster: movie.poster_path || '',
                    isFavorite: false
                };
            });
            
            films = apiFilms;
            apiFilmsLoaded = true;
            saveData();
            console.log(`Loaded ${films.length} films from API`);
        }
    } catch (error) {
        console.error('Error fetching films from API:', error);
        if (films.length === 0) {
            films = [
                { id: 1, title: "Inception", directorId: 1, year: 2010, genre: "Sci-Fi", rating: 8.8, isFavorite: true },
                { id: 2, title: "Pulp Fiction", directorId: 2, year: 1994, genre: "Policier", rating: 8.9, isFavorite: false }
            ];
            saveData();
        }
    }
}

function saveData() {
    localStorage.setItem('cinetech_directors', JSON.stringify(directors));
    localStorage.setItem('cinetech_films', JSON.stringify(films));
    updateDashboard();
}

function navigateTo(id) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`section-${id}`).classList.remove('hidden');
    ['nav-dashboard','nav-films','nav-favs','nav-directors','nav-catalog'].forEach(nid => {
        const el = document.getElementById(nid);
        if(!el) return;
        el.classList.remove('bg-blue-600','text-white');
        el.classList.add('text-slate-300');
    });
    const navId = id === 'favorites' ? 'nav-favs' : `nav-${id}`;
    const activeNav = document.getElementById(navId);
    if(activeNav) { activeNav.classList.remove('text-slate-300'); activeNav.classList.add('bg-blue-600','text-white'); }

    document.getElementById('page-title').innerText = id === 'films' ? "Gestion de Films" : id === 'directors' ? "Réalisateurs" : id === 'favorites' ? "Favoris" : id === 'catalog' ? "Catalogue Films" : "Dashboard";
    if(id === 'films') renderFilmsTable();
    if(id === 'directors') renderDirectorsList();
    if(id === 'favorites') renderFavorites();
    if(id === 'catalog') renderCatalog();
}

function setupEventListeners() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navFilms = document.getElementById('nav-films');
    const navDirectors = document.getElementById('nav-directors');
    const navFavs = document.getElementById('nav-favs');
    const navCatalog = document.getElementById('nav-catalog');
    
    if(navDashboard) navDashboard.onclick = () => navigateTo('dashboard');
    if(navFilms) navFilms.onclick = () => navigateTo('films');
    if(navDirectors) navDirectors.onclick = () => navigateTo('directors');
    if(navFavs) navFavs.onclick = () => navigateTo('favorites');
    if(navCatalog) navCatalog.onclick = () => navigateTo('catalog');
}

const genreColors = {
    "Sci-Fi": "bg-cyan-500",
    "Science-Fiction": "bg-cyan-500",
    "Action": "bg-red-500",
    "Policier": "bg-amber-700",
    "Comédie": "bg-pink-500",
    "Drame": "bg-purple-600",
    "Thriller": "bg-slate-700",
    "Horreur": "bg-red-700",
    "Romance": "bg-rose-500",
    "Aventure": "bg-orange-500"
};

function getGenreColor(genre) {
    return genreColors[genre] || "bg-blue-600";
}

window.toggleFavorite = (id) => {
    const f = films.find(x => x.id === id);
    f.isFavorite = !f.isFavorite;
    saveData();
    if (f.isFavorite) {
        navigateTo('favorites');
    } else {
        renderFilmsTable();
    }
};

window.setFilmRating = (id, rating) => {
    const f = films.find(x => x.id === id);
    if(f) {
        f.rating = rating;
        saveData();
        renderFilmsTable();
    }
};

function renderFavorites() {
    const tbody = document.getElementById('favs-table-body');
    tbody.innerHTML = '';
    const favs = films.filter(f => f.isFavorite);
    if (favs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-400">Aucun favori</td></tr>`;
        return;
    }

    favs.forEach(film => {
        const d = directors.find(x => x.id == film.directorId)?.name || "Inconnu";
        const stars = Math.round((film.rating || 0) / 2);
        let starHTML = '';
        for(let i=1; i<=5; i++) starHTML += `<i class="${i<=stars?'fas':'far'} fa-star text-yellow-500 text-sm"></i>`;
        
        const row = document.createElement('tr');
        row.className = "border-b hover:bg-gray-50 transition";
        row.innerHTML = `
            <td class="p-3"><img src="${film.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100'}" class="w-10 h-14 object-cover rounded"></td>
            <td class="p-3 font-bold text-gray-800">${film.title}</td>
            <td class="p-3 text-gray-600">${d}</td>
            <td class="p-3 text-gray-600">${film.year}</td>
            <td class="p-3"><span class="${getGenreColor(film.genre)} text-white text-[11px] font-black px-2 py-1 rounded-full">${film.genre}</span></td>
            <td class="p-3">
                <div class="flex items-center gap-2">
                    <div class="flex gap-1">${starHTML}</div>
                    <span class="text-gray-700 font-bold text-sm">${(film.rating || 0).toFixed(1)}/10</span>
                </div>
            </td>
            <td class="p-3 text-center flex gap-2 justify-center">
                <button onclick="editFilm(${film.id})" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><i class="fas fa-edit"></i></button>
                <button onclick="toggleFavorite(${film.id})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i class="fas fa-heart text-red-500"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderFilmsTable() {
    renderGenreFilters();
    const tbody = document.getElementById('films-table-body');
    const search = document.getElementById('search-film').value.toLowerCase();
    const selectedGenre = document.getElementById('selectedGenre')?.value || '';
    tbody.innerHTML = '';

    let filtered = films.filter(f => {
        const matchSearch = f.title.toLowerCase().includes(search) || f.genre.toLowerCase().includes(search);
        const matchGenre = !selectedGenre || f.genre === selectedGenre;
        return matchSearch && matchGenre;
    });
    
    filtered.sort((a,b) => a.title.localeCompare(b.title));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-400">Aucun film trouvé</td></tr>`;
        return;
    }

    filtered.forEach(film => {
        const d = directors.find(x => x.id == film.directorId)?.name || "Inconnu";
        const stars = Math.round((film.rating || 0) / 2);
        let starHTML = '';
        for(let i=1; i<=5; i++) {
            const isFilled = i <= stars;
            starHTML += `<span onclick="setFilmRating(${film.id}, ${i * 2})" style="cursor: pointer;" class="inline-block hover:scale-125 transition-transform"><i class="${isFilled?'fas':'far'} fa-star text-yellow-500 text-sm"></i></span>`;
        }

        const genreColor = getGenreColor(film.genre);

        const row = document.createElement('tr');
        row.className = "border-b hover:bg-gray-50 transition";
        row.innerHTML = `
            <td class="p-3"><img src="${film.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=100'}" class="w-10 h-14 object-cover rounded"></td>
            <td class="p-3 font-bold text-gray-800">${film.title}</td>
            <td class="p-3 text-gray-600">${d}</td>
            <td class="p-3 text-gray-600">${film.year}</td>
            <td class="p-3"><span class="${genreColor} text-white text-[11px] font-black px-2 py-1 rounded-full">${film.genre}</span></td>
            <td class="p-3">
                <div class="flex items-center gap-2">
                    <div class="flex gap-1">${starHTML}</div>
                    <span class="text-gray-700 font-bold text-sm">${(film.rating || 0).toFixed(1)}/10</span>
                    <button onclick="toggleFavorite(${film.id})" class="ml-2 text-lg"><i class="${film.isFavorite?'fas':'far'} fa-heart ${film.isFavorite?'text-red-500':'text-gray-300'}"></i></button>
                </div>
            </td>
            <td class="p-3 text-center flex gap-2 justify-center">
                <button onclick="editFilm(${film.id})" class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><i class="fas fa-edit"></i></button>
                <button onclick="deleteFilm(${film.id})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderGenreFilters() {
    const container = document.getElementById('genre-filters');
    container.innerHTML = '';
    
    const genres = [...new Set(films.map(f => f.genre))].sort();
    const selectedGenre = document.getElementById('selectedGenre')?.value || '';
    
    const allBtn = document.createElement('button');
    allBtn.className = `px-4 py-2 rounded-full font-bold text-sm transition-all ${!selectedGenre ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`;
    allBtn.innerText = 'Tous';
    allBtn.onclick = () => { document.getElementById('selectedGenre').value = ''; renderFilmsTable(); };
    container.appendChild(allBtn);
    
    genres.forEach(genre => {
        const btn = document.createElement('button');
        const isSelected = selectedGenre === genre;
        const color = getGenreColor(genre);
        btn.className = `px-4 py-2 rounded-full font-bold text-sm transition-all ${isSelected ? `${color} text-white` : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`;
        btn.innerText = genre;
        btn.onclick = () => { document.getElementById('selectedGenre').value = genre; renderFilmsTable(); };
        container.appendChild(btn);
    });
}

const modal = document.getElementById('film-modal');

function setupStarRating() {
    const ratingInput = document.getElementById('film-rating');
    const starsContainer = document.getElementById('star-rating-container');
    
    if(!starsContainer) return;
    
    starsContainer.innerHTML = '';
    for(let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.innerHTML = '<i class="fas fa-star text-yellow-500 text-3xl cursor-pointer transition-all"></i>';
        star.style.cursor = 'pointer';
        star.title = i * 2 + '/10';
        star.onclick = () => {
            ratingInput.value = i * 2; 
            updateStarDisplay();
        };
        star.onmouseover = () => {
            for(let j = 1; j <= 5; j++) {
                const s = starsContainer.children[j-1];
                if(j <= i) {
                    s.style.opacity = '1';
                    s.style.transform = 'scale(1.2)';
                } else {
                    s.style.opacity = '0.4';
                    s.style.transform = 'scale(1)';
                }
            }
        };
        starsContainer.appendChild(star);
    }
    
    starsContainer.onmouseout = updateStarDisplay;
}

function updateStarDisplay() {
    const ratingInput = document.getElementById('film-rating');
    const starsContainer = document.getElementById('star-rating-container');
    if(!starsContainer) return;
    
    const rating = parseFloat(ratingInput.value) || 0;
    const stars = Math.round(rating / 2);
    
    for(let j = 1; j <= 5; j++) {
        const s = starsContainer.children[j-1];
        if(j <= stars) {
            s.style.opacity = '1';
            s.style.transform = 'scale(1)';
        } else {
            s.style.opacity = '0.4';
            s.style.transform = 'scale(1)';
        }
    }
}

window.openFilmModal = (isEdit = false) => {
    const directorList = document.getElementById('director-list');
    if(directorList) {
        directorList.innerHTML = directors.map(d => `<option value="${d.name}">`).join('');
    }
    if(modal) modal.classList.remove('hidden');
    if(!isEdit) { 
        const form = document.getElementById('film-form');
        const filmId = document.getElementById('film-id');
        if(form) form.reset();
        if(filmId) filmId.value = ""; 
    }
    setupStarRating();
    updateStarDisplay();
};
window.closeFilmModal = () => { if(modal) modal.classList.add('hidden'); };

function setupFormListeners() {
    const posterInput = document.getElementById('film-poster');
    const filmForm = document.getElementById('film-form');
    const searchInput = document.getElementById('search-film');
    const ratingInput = document.getElementById('film-rating');
    
    if(ratingInput) {
        ratingInput.addEventListener('input', updateStarDisplay);
    }
    
    if(posterInput) {
        posterInput.onchange = (e) => {
            const r = new FileReader();
            r.onload = (x) => {
                const preview = document.getElementById('poster-preview');
                if(preview) {
                    preview.src = x.target.result;
                    preview.classList.remove('hidden');
                }
            };
            r.readAsDataURL(e.target.files[0]);
        };
    }
    
    if(filmForm) {
        filmForm.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('film-id').value;
            const dName = document.getElementById('film-director').value;
            let dId = directors.find(x => x.name === dName)?.id || (Date.now() + 1);
            if(!directors.find(x => x.id === dId)) directors.push({id: dId, name: dName});

            const posterPreview = document.getElementById('poster-preview');
            const data = {
                id: id ? parseInt(id) : Date.now(),
                title: document.getElementById('film-title').value,
                directorId: dId,
                year: document.getElementById('film-year').value,
                genre: document.getElementById('film-genre').value,
                rating: document.getElementById('film-rating').value || 0,
                poster: posterPreview?.src || '',
                isFavorite: id ? films.find(x => x.id == id).isFavorite : false
            };

            if(id) films = films.map(f => f.id == id ? data : f);
            else films.push(data);
            
            saveData();
            window.closeFilmModal();
            renderFilmsTable();
        };
    }
    
    if(searchInput) {
        searchInput.oninput = renderFilmsTable;
    }
    
    const catalogSearch = document.getElementById('catalog-search');
    if(catalogSearch) {
        catalogSearch.oninput = renderCatalog;
    }
}

function renderCatalog() {
    renderCatalogGenreFilters();
    const container = document.getElementById('catalog-grid');
    const search = document.getElementById('catalog-search').value.toLowerCase();
    const selectedGenre = document.getElementById('catalog-selectedGenre')?.value || '';
    container.innerHTML = '';

    let filtered = films.filter(f => {
        const matchSearch = f.title.toLowerCase().includes(search) || f.genre.toLowerCase().includes(search);
        const matchGenre = !selectedGenre || f.genre === selectedGenre;
        return matchSearch && matchGenre;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full p-8 text-center text-gray-400">Aucun film trouvé</div>`;
        return;
    }

    filtered.forEach(film => {
        const d = directors.find(x => x.id == film.directorId)?.name || "Inconnu";
        const stars = Math.round((film.rating || 0) / 2);
        let starHTML = '';
        for(let i=1; i<=5; i++) starHTML += `<i class="${i<=stars?'fas':'far'} fa-star text-yellow-400 text-xs"></i>`;
        
        const card = document.createElement('div');
        card.className = "bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer";
        card.onclick = () => {
            navigateTo('films');
            setTimeout(() => {
                document.getElementById('search-film').value = film.title;
                renderFilmsTable();
            }, 100);
        };
        
        const posterUrl = film.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400';
        
        card.innerHTML = `
            <div class="relative aspect-[2/3] bg-gray-200">
                <img src="${posterUrl}" alt="${film.title}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400'">
                <div class="absolute top-2 right-2">
                    <button onclick="event.stopPropagation(); toggleFavorite(${film.id})" class="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition">
                        <i class="${film.isFavorite?'fas':'far'} fa-heart ${film.isFavorite?'text-red-500':'text-gray-400'} text-lg"></i>
                    </button>
                </div>
                <div class="absolute bottom-2 left-2">
                    <span class="${getGenreColor(film.genre)} text-white text-xs font-bold px-2 py-1 rounded-full">${film.genre}</span>
                </div>
            </div>
            <div class="p-3">
                <h3 class="font-bold text-sm text-gray-800 mb-1 truncate" title="${film.title}">${film.title}</h3>
                <p class="text-xs text-gray-500 mb-2">${d} • ${film.year}</p>
                <div class="flex items-center justify-between">
                    <div class="flex gap-0.5">${starHTML}</div>
                    <span class="text-xs font-bold text-gray-700">${(film.rating || 0).toFixed(1)}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCatalogGenreFilters() {
    const container = document.getElementById('catalog-genre-filters');
    container.innerHTML = '';
    
    // Add hidden input for selected genre
    let selectedInput = document.getElementById('catalog-selectedGenre');
    if (!selectedInput) {
        selectedInput = document.createElement('input');
        selectedInput.type = 'hidden';
        selectedInput.id = 'catalog-selectedGenre';
        selectedInput.value = '';
        container.appendChild(selectedInput);
    }
    
    const genres = [...new Set(films.map(f => f.genre))].sort();
    const selectedGenre = selectedInput.value;
    
    const allBtn = document.createElement('button');
    allBtn.className = `px-4 py-2 rounded-full font-bold text-sm transition-all ${!selectedGenre ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`;
    allBtn.innerText = 'Tous';
    allBtn.onclick = () => { selectedInput.value = ''; renderCatalog(); };
    container.appendChild(allBtn);
    
    genres.forEach(genre => {
        const btn = document.createElement('button');
        const isSelected = selectedGenre === genre;
        const color = getGenreColor(genre);
        btn.className = `px-4 py-2 rounded-full font-bold text-sm transition-all ${isSelected ? `${color} text-white` : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`;
        btn.innerText = genre;
        btn.onclick = () => { selectedInput.value = genre; renderCatalog(); };
        container.appendChild(btn);
    });
}

function renderDirectorsList() {
    const container = document.getElementById('directors-list');
    container.innerHTML = '';
    directors.forEach(director => {
        const filmsCount = films.filter(f => f.directorId === director.id).length;
        const card = document.createElement('div');
        card.className = "bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all";
        card.innerHTML = `
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">${director.name.charAt(0)}</div>
                <div>
                    <h4 class="font-black text-lg">${director.name}</h4>
                    <p class="text-gray-500 text-sm">${filmsCount} film${filmsCount > 1 ? 's' : ''}</p>
                </div>
            </div>
            <button onclick="deleteDirector(${director.id})" class="w-full text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm font-bold"><i class="fas fa-trash mr-2"></i>Supprimer</button>
        `;
        container.appendChild(card);
    });
}

window.deleteDirector = (id) => {
    if(films.some(f => f.directorId === id)) {
        alert("Impossible : Ce réalisateur a des films liés.");
        return;
    }
    if(confirm("Supprimer ce réalisateur ?")) {
        directors = directors.filter(d => d.id !== id);
        saveData();
        renderDirectorsList();
    }
};

window.openDirectorModal = () => {
    const name = prompt("Nom du réalisateur :");
    if(name && name.trim()) {
        if(!directors.find(d => d.name.toLowerCase() === name.toLowerCase())) {
            directors.push({id: Date.now(), name: name.trim()});
            saveData();
            renderDirectorsList();
        } else alert("Ce réalisateur existe déjà !");
    }
};

window.deleteFilm = (id) => { if(confirm("Supprimer ?")) { films = films.filter(f => f.id !== id); saveData(); renderFilmsTable(); } };
window.editFilm = (id) => {
    const f = films.find(x => x.id === id);
    openFilmModal(true);
    document.getElementById('film-id').value = f.id;
    document.getElementById('film-title').value = f.title;
    document.getElementById('film-year').value = f.year;
    document.getElementById('film-genre').value = f.genre;
    document.getElementById('film-rating').value = f.rating;
    document.getElementById('film-director').value = directors.find(x => x.id == f.directorId)?.name || "";
    if(f.poster) { document.getElementById('poster-preview').src = f.poster; document.getElementById('poster-preview').classList.remove('hidden'); }
};

let myChart;
function updateDashboard() {
    const elTotalFilms = document.getElementById('kpi-total-films');
    if(elTotalFilms) elTotalFilms.innerText = films.length;
    
    const elTotalFavs = document.getElementById('kpi-total-favs');
    if(elTotalFavs) elTotalFavs.innerText = films.filter(f => f.isFavorite).length;
    
    const elTotalDirectors = document.getElementById('kpi-total-directors');
    if(elTotalDirectors) elTotalDirectors.innerText = directors.length;
    
    const ctx = document.getElementById('myChart');
    if(!ctx) return;
    
    const counts = {}; 
    films.forEach(f => counts[f.genre] = (counts[f.genre] || 0) + 1);
    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(counts), datasets: [{ label: 'Films', data: Object.values(counts), backgroundColor: '#3b82f6' }] }, options: { maintainAspectRatio: false }});
}

document.addEventListener('DOMContentLoaded', async () => { 
    setupEventListeners();
    setupFormListeners();
    
    await fetchFilmsFromAPI();
    
    navigateTo('dashboard'); 
    updateDashboard();
});