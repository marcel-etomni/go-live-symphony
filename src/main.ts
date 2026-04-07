/**
 * @filepath /src/main.ts
 * @description Entry point for the application
 */

import './style.css';
import content from './content.json';

// Preload hero images, then run the overlay animation
function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
	return Promise.all(
		urls.map(
			(src) =>
				new Promise<HTMLImageElement>((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = reject;
					img.src = src;
				}),
		),
	);
}

// Freeze scroll and prevent initial hash jump immediately
document.body.style.overflow = 'hidden';
if (window.location.hash) {
	history.scrollRestoration = 'manual';
	window.scrollTo(0, 0);
}

const heroImageUrls = content.hero.images.map(
	(img: { src: string }) => img.src,
);

preloadImages(heroImageUrls).then(() => {
	initOverlay();
	initHeroSlideshow();
});

function initOverlay() {
	const overlay = document.getElementById('overlay')!;
	const overlayTitle = document.getElementById('overlay-title')!;
	const overlayLockup = document.getElementById('overlay-lockup')!;

	// Build staggered character spans for the title
	const titleText = content.overlay.title;
	overlayTitle.innerHTML = titleText
		.split('')
		.map(
			(char, i) =>
				`<span class="inline-block opacity-0 translate-y-3 transition-all duration-350 ease-out" style="transition-delay:${i * 50}ms">${char === ' ' ? '&nbsp;' : char}</span>`,
		)
		.join('');

	// Set lockup text
	overlayLockup.textContent = content.overlay.lockup;

	// Trigger staggered character animation
	requestAnimationFrame(() => {
		setTimeout(() => {
			overlayTitle.querySelectorAll('span').forEach((span) => {
				span.classList.remove('opacity-0', 'translate-y-3');
				span.classList.add('opacity-100', 'translate-y-0');
			});
		}, 200);
	});

	// Fade in lockup after characters finish
	const charAnimDuration = 200 + titleText.length * 50 + 350;
	setTimeout(() => {
		overlayLockup.style.opacity = '1';
	}, charAnimDuration);

	// Fade out title + lockup, then wipe background
	const fadeOutStart = charAnimDuration + 600;
	setTimeout(() => {
		overlayTitle.style.transition = 'opacity 400ms ease-in-out';
		overlayLockup.style.transition = 'opacity 400ms ease-in-out';
		overlayTitle.style.opacity = '0';
		overlayLockup.style.opacity = '0';

		// After text fades, wipe background left-to-right
		setTimeout(() => {
			overlay.style.clipPath = 'inset(0 0 0 0)';
			// Force layout so the initial clip-path is applied before animating
			overlay.offsetHeight;
			overlay.style.transition = 'clip-path 700ms cubic-bezier(0.4, 0, 0.2, 1)';
			overlay.style.clipPath = 'inset(0 0 0 100%)';

			overlay.addEventListener(
				'transitionend',
				() => {
					overlay.remove();
					document.body.style.overflow = '';
					initScrollAnimations();

					// Scroll to hash target after overlay completes
					if (window.location.hash) {
						const target = document.querySelector(window.location.hash);
						if (target) {
							target.scrollIntoView({ behavior: 'smooth' });
						}
					}
				},
				{ once: true },
			);
		}, 450);
	}, fadeOutStart);
}

// Hero slideshow: looping fade animation
function initHeroSlideshow() {
	const container = document.getElementById('hero-slideshow')!;
	const images = content.hero.images as { src: string; alt: string }[];
	const INTERVAL = 5000;
	const FADE_DURATION = 1000;

	// Create stacked img elements
	images.forEach((img, i) => {
		const el = document.createElement('img');
		el.src = img.src;
		el.alt = img.alt;
		el.className = 'absolute inset-0 w-full h-full object-cover';
		el.style.transition = `opacity ${FADE_DURATION}ms ease-in-out`;
		el.style.opacity = i === 0 ? '1' : '0';
		container.appendChild(el);
	});

	let current = 0;
	const imgElements = container.querySelectorAll('img');

	setInterval(() => {
		const next = (current + 1) % images.length;
		imgElements[current].style.opacity = '0';
		imgElements[next].style.opacity = '1';
		current = next;
	}, INTERVAL);
}

// Resolve a dot-notation path like "hero.heading" against the content object
function resolve(path: string): string {
	return path
		.split('.')
		.reduce(
			(obj: unknown, key) => (obj as Record<string, unknown>)[key],
			content,
		) as string;
}

// Populate all elements with data-content attributes
document.querySelectorAll<HTMLElement>('[data-content]').forEach((el) => {
	el.textContent = resolve(el.dataset.content!);
});

// Dynamic year
document.querySelector('[data-slot="dynamic-year"]')!.textContent = new Date()
	.getFullYear()
	.toString();

// Header nav
const headerNav = document.getElementById('header-nav')!;
headerNav.innerHTML = content.header.nav
	.map(
		(item) => `
		<li data-slot="section-header-nav-item">
			<a data-slot="link" href="${item.href}" class="font-semibold text-xs uppercase select-none cursor-pointer hover:text-[#253a86]">
				<span class="w-full h-[200%]"></span>
				<span>${item.label}</span>
			</a>
		</li>`,
	)
	.join('');

// Mobile nav
const mobileNavList = document.getElementById('mobile-nav-list')!;
mobileNavList.innerHTML = content.header.nav
	.map(
		(item) => `
		<li data-slot="section-header-mobile-nav-item">
			<a data-slot="link" href="${item.href}" class="block px-2 py-3 font-semibold text-sm uppercase select-none cursor-pointer hover:opacity-70">
				${item.label}
			</a>
		</li>`,
	)
	.join('');

const mobileNavCta = document.getElementById('mobile-nav-cta')!;
mobileNavCta.setAttribute('href', content.header.cta.href);
mobileNavCta.querySelector('span')!.textContent = content.header.cta.label;

// Mobile nav toggle
const hamburgerBtn = document.getElementById('hamburger-btn')!;
const mobileOverlay = document.getElementById('mobile-overlay')!;
const mobileNav = document.getElementById('mobile-nav')!;
const mobileNavClose = document.getElementById('mobile-nav-close')!;

function openMobileNav() {
	hamburgerBtn.classList.add('hamburger-open');
	hamburgerBtn.setAttribute('aria-expanded', 'true');
	mobileOverlay.classList.remove('opacity-0', 'pointer-events-none');
	mobileOverlay.classList.add('opacity-100');
	mobileNav.classList.remove('translate-x-full');
	mobileNav.classList.add('translate-x-0');
	document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
	hamburgerBtn.classList.remove('hamburger-open');
	hamburgerBtn.setAttribute('aria-expanded', 'false');
	mobileOverlay.classList.remove('opacity-100');
	mobileOverlay.classList.add('opacity-0', 'pointer-events-none');
	mobileNav.classList.remove('translate-x-0');
	mobileNav.classList.add('translate-x-full');
	document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', () => {
	const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
	isOpen ? closeMobileNav() : openMobileNav();
});

mobileNavClose.addEventListener('click', closeMobileNav);
mobileOverlay.addEventListener('click', closeMobileNav);

// Close mobile nav on link click
mobileNavList.addEventListener('click', (e) => {
	if ((e.target as HTMLElement).closest('a')) closeMobileNav();
});
mobileNavCta.addEventListener('click', closeMobileNav);

// Header CTA
const headerCta = document.getElementById('header-cta')!;
headerCta.setAttribute('href', content.header.cta.href);
headerCta.querySelector('span')!.textContent = content.header.cta.label;

// Hero CTA
const heroCta = document.getElementById('hero-cta')!;
heroCta.setAttribute('href', content.hero.cta.href);
heroCta.querySelector('span')!.textContent = content.hero.cta.label;

// Hero slideshow is initialised in initHeroSlideshow() above

// About bullets
const aboutBullets = document.getElementById('about-bullets')!;
const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>`;
aboutBullets.innerHTML = content.about.bullets
	.map(
		(text) => `
		<li data-slot="section-bullets-item" class="flex justify-start items-start gap-4">
			<span data-slot="section-bullets-icon">${checkIcon}</span>
			<span class="grow">${text}</span>
		</li>`,
	)
	.join('');

// About images
const aboutImages = document.getElementById('about-images')!;
aboutImages.innerHTML = content.about.images
	.map(
		(img) =>
			`<img data-slot="section-image-grid-img" src="${img.src}" alt="${img.alt}" class="overflow-hidden rounded bg-black text-white" />`,
	)
	.join('');

// Industries cards
const industriesGrid = document.getElementById('industries-grid')!;
content.industries.items.forEach((item) => {
	const card = document.createElement('div');
	card.dataset.slot = 'section-col';
	card.className =
		'flex flex-col justify-start items-stretch rounded-lg gap-6 shadow bg-white';
	card.innerHTML = `
		<div data-slot="section-col-container" class="flex flex-col justify-start items-stretch px-6 py-10 gap-6 md:px-8 lg:px-10">
			<div data-slot="section-icon">${item.icon}</div>
			<div data-slot="section-content" class="flex flex-col justify-start items-stretch gap-3">
				<h3 data-slot="section-subheading" class="font-heading font-bold text-2xl">${item.title}</h3>
				<p>${item.description}</p>
			</div>
		</div>`;
	industriesGrid.appendChild(card);
});

// Services cards
const servicesGrid = document.getElementById('services-grid')!;
content.services.items.forEach((item) => {
	const card = document.createElement('div');
	card.dataset.slot = 'section-col';
	card.className =
		'flex flex-col justify-start items-stretch rounded-lg gap-6 shadow bg-[#f9fafb]';
	card.innerHTML = `
		<div data-slot="section-col-container" class="flex flex-col justify-start items-stretch px-6 py-10 gap-6 md:flex-row md:items-start md:px-8 lg:px-10">
			<div data-slot="section-thumbnail" class="min-w-20 max-w-20 aspect-square rounded overflow-hidden bg-current">
				<img class="w-full h-full object-cover" src="${item.image.src}" alt="${item.image.alt}" />
			</div>
			<div data-slot="section-content" class="flex flex-col justify-start items-stretch gap-3">
				<h3 data-slot="section-subheading" class="font-heading font-bold text-2xl">${item.title}</h3>
				<p>${item.description}</p>
			</div>
		</div>`;
	servicesGrid.appendChild(card);
});

// Why Us cards
const whyUsGrid = document.getElementById('why-us-grid')!;
content.whyUs.items.forEach((item) => {
	const card = document.createElement('div');
	card.dataset.slot = 'section-col';
	card.className =
		'flex flex-col justify-start items-stretch rounded-lg gap-6 shadow bg-[#fafbfd]';
	card.innerHTML = `
		<div data-slot="section-col-container" class="flex flex-col justify-start items-stretch px-6 py-10 gap-6 md:px-8 lg:px-10">
			<div data-slot="section-icon">${item.icon}</div>
			<div data-slot="section-content" class="flex flex-col justify-start items-stretch gap-3">
				<h3 data-slot="section-subheading" class="font-heading font-bold text-2xl">${item.title}</h3>
				<p>${item.description}</p>
			</div>
		</div>`;
	whyUsGrid.appendChild(card);
});

// Contact section
const contactProfileImg = document.getElementById(
	'contact-profile-image',
) as HTMLImageElement;
contactProfileImg.src = content.contact.profile.image.src;
contactProfileImg.alt = content.contact.profile.image.alt;

const contactPhone = document.getElementById('contact-phone')!;
contactPhone.setAttribute('href', content.contact.profile.phone.href);
contactPhone.querySelector('span')!.textContent =
	content.contact.profile.phone.label;

const contactSubmit = document.getElementById('contact-submit')!;
contactSubmit.textContent = content.contact.form.submitLabel;

// Contact form validation & submission
const contactForm = document.getElementById('contact-form') as HTMLFormElement;

const validationMessages: Record<string, string> = {
	name: 'Please enter your full name.',
	email: 'Please enter your email address.',
	'email:invalid': 'Please enter a valid email address.',
	company: 'Please enter your company name.',
	message: 'Please enter a message.',
};

function showError(
	input: HTMLInputElement | HTMLTextAreaElement,
	message: string,
) {
	const error = input
		.closest('[data-slot="section-form-field"]')
		?.querySelector<HTMLSpanElement>('[data-slot="section-form-error"]');
	if (error) {
		error.textContent = message;
		error.classList.remove('hidden');
	}
	input.classList.remove('border-gray-300');
	input.classList.add('border-red-500');
}

function clearError(input: HTMLInputElement | HTMLTextAreaElement) {
	const error = input
		.closest('[data-slot="section-form-field"]')
		?.querySelector<HTMLSpanElement>('[data-slot="section-form-error"]');
	if (error) {
		error.textContent = '';
		error.classList.add('hidden');
	}
	input.classList.remove('border-red-500');
	input.classList.add('border-gray-300');
}

function validateField(input: HTMLInputElement | HTMLTextAreaElement): boolean {
	const name = input.name;

	if (input.hasAttribute('required') && !input.value.trim()) {
		showError(input, validationMessages[name] ?? 'This field is required.');
		return false;
	}

	if (input.type === 'email' && input.value.trim()) {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(input.value.trim())) {
			showError(input, validationMessages['email:invalid']);
			return false;
		}
	}

	clearError(input);
	return true;
}

// Live validation: clear errors on input
contactForm
	.querySelectorAll<
		HTMLInputElement | HTMLTextAreaElement
	>('input:not([type="hidden"]), textarea')
	.forEach((input) => {
		input.addEventListener('input', () => validateField(input));
	});

// Mark sections as hidden immediately (before overlay finishes)
const scrollSections = document.querySelectorAll<HTMLElement>(
	'#hero, #about, #industries, #services, #why-us, #contact',
);
scrollSections.forEach((section) => {
	section.classList.add('fade-up');
});

// Start observing after overlay completes + 300ms delay
function initScrollAnimations() {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.classList.add('fade-up-visible');
				observer.unobserve(entry.target);
			});
		},
		{ threshold: 0.3 },
	);

	scrollSections.forEach((section) => observer.observe(section));
}

contactForm.addEventListener('submit', async (e) => {
	e.preventDefault();

	const fields = Array.from(
		contactForm.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
			'input:not([type="hidden"]), textarea',
		),
	);
	const invalidFields = fields.filter((input) => !validateField(input));

	if (invalidFields.length > 0) {
		invalidFields[0].focus();
		return;
	}

	// Submit via fetch to avoid page redirect
	const submitBtn = contactSubmit as HTMLButtonElement;
	const originalText = submitBtn.textContent;
	submitBtn.disabled = true;
	submitBtn.textContent = 'Sending...';

	try {
		const response = await fetch(contactForm.action, {
			method: 'POST',
			body: new FormData(contactForm),
			headers: { Accept: 'application/json' },
		});

		if (response.ok) {
			const { title, message } = content.contact.form.thankYou;
			contactForm.innerHTML = `
				<div class="flex flex-col items-center justify-center gap-4 py-10 text-center">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-16 text-green-600">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
					<h3 class="font-heading font-bold text-2xl">${title}</h3>
					<p class="text-gray-600">${message}</p>
				</div>`;
			return;
		} else {
			submitBtn.textContent = 'Something went wrong. Please try again.';
			submitBtn.classList.remove('bg-[#253a86]');
			submitBtn.classList.add('bg-red-600');
			setTimeout(() => {
				submitBtn.textContent = originalText;
				submitBtn.classList.remove('bg-red-600');
				submitBtn.classList.add('bg-[#253a86]');
			}, 3000);
		}
	} catch {
		submitBtn.textContent = 'Connection error. Please try again.';
		submitBtn.classList.remove('bg-[#253a86]');
		submitBtn.classList.add('bg-red-600');
		setTimeout(() => {
			submitBtn.textContent = originalText;
			submitBtn.classList.remove('bg-red-600');
			submitBtn.classList.add('bg-[#253a86]');
		}, 3000);
	} finally {
		submitBtn.disabled = false;
	}
});
