const body = document.body;
const navbar = document.querySelector(".navbar");
const navbarLinks = document.querySelector(".navbar .links");

let higlightedLink = navbarLinks.querySelector(".highlighted");
let btn = document.querySelector(".menu-toggle");

function handleLinkClick() {
	higlightedLink.classList.remove("highlighted");
	this.parentElement.classList.add("highlighted");
	higlightedLink = this.parentElement;
	closeMenu();
}

function handleMenu() {
	btn = btn || document.querySelector(".icon");
	if (!btn) return;

	let idx = navbarLinks.className.search("open");

	if (idx !== -1) {
		closeMenu();
	} else {
		openMenu();
	}
}

function openMenu(elem) {
	navbar.classList.add("open");
	navbarLinks.classList.add("open");
	body.classList.add("scroll-lock");
	btn.classList.add("opened")
	btn.setAttribute( 'aria-expanded', 'true' );
	//btn.innerHTML = "X";
}

function closeMenu(elem) {
	navbar.classList.remove("open");
	navbarLinks.classList.remove("open")
	body.classList.remove("scroll-lock");
	btn.classList.remove("opened")
	btn.setAttribute( 'aria-expanded', 'false' );
	//btn.innerHTML = "&#9776";
}


navbarLinks.querySelectorAll("li").forEach((elem) => {
	elem.querySelector("a").addEventListener("click", handleLinkClick);
});


window.addEventListener('scroll', function(e) {
	let currentScrollPosition = window.scrollY;
	if (currentScrollPosition > navbar.clientHeight) {
		navbar.classList.add("scrolled");
	} else {
		navbar.classList.remove("scrolled");
	}
});