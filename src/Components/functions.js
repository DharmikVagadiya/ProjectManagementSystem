const searchOptions = document.querySelector('.searchOptions');

if (searchOptions) {
    searchOptions.addEventListener('click', () => {
        document.querySelector('.searchOptions').classList.toggle('fa-angle-down');
        document.querySelector('.searchOptions').classList.toggle('fa-angle-up');
        let SearchOptions = document.querySelector('.search-options');
        SearchOptions.classList.toggle('hidden');
    });
}