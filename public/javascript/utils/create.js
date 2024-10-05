function createDOMElement(tag, className = '', content = '', type = '') {
	const element = document.createElement(tag);

	if (className) element.classList.add(className);

	if (content !== '') element.textContent = content;

	if (tag == 'input') element.placeholder = content;

	if (type !== '') element.type = type;

	return element;
}

async function createImageElement(src, alt, className = '') {
	let image = null;

	while (!image) {
		try {
			const cache = await caches.open('images-cache');
			const cachedResponse = await cache.match(src);

			if (cachedResponse) {
				// Use cached image
				image = new Image();
				const cachedBlob = await cachedResponse.blob();
				image.src = URL.createObjectURL(cachedBlob);
				image.alt = alt;
				image.className = className;
			} else {
				// Fetch the image if not found in cache
				const response = await fetch(src, {
					cache: 'force-cache',
					headers: {
						'x-force-cache': 'true',
					},
				});

				if (response.ok) {
					const responseClone = response.clone();

					image = new Image();
					const fetchedBlob = await response.blob();
					image.src = URL.createObjectURL(fetchedBlob);
					image.alt = alt;
					image.className = className;

					await cache.put(src, responseClone);

					await new Promise((resolve, reject) => {
						image.onload = resolve;
						image.onerror = reject;
					});
				} else {
					console.error(`Failed to fetch image from ${src}`);
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}
		} catch (error) {
			console.error('Error fetching image:', error);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	return image;
}
async function loadEditableSVGFile(filePath, className) {
	try {
		const response = await fetch(filePath);
		const svgData = await response.text();

		const svgElement = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'svg',
		);

		svgElement.innerHTML = svgData;

		if (className) {
			svgElement.classList.add(className);
		}

		return svgElement;
	} catch (error) {
		console.error('Error loading SVG file:', error);
		return null;
	}
}

async function createCheckMark(color = '#3D3D3D', width = '40') {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.classList.add('checked');
	svg.setAttribute('width', width);
	svg.setAttribute('height', width);
	svg.setAttribute('viewBox', '0 0 40 40');
	svg.setAttribute('fill', 'none');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute(
		'd',
		'M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L6 20L8.82 17.18L16 24.34L31.18 9.16L34 12L16 30Z',
	);
	path.setAttribute('fill', color);

	svg.appendChild(path);

	return svg;
}

async function createUncheckMark() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.classList.add('unchecked');

	svg.setAttribute('width', '40');
	svg.setAttribute('height', '40');
	svg.setAttribute('viewBox', '0 0 40 40');
	svg.setAttribute('fill', 'none');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute(
		'd',
		'M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM20 36C11.16 36 4 28.84 4 20C4 11.16 11.16 4 20 4C28.84 4 36 11.16 36 20C36 28.84 28.84 36 20 36Z',
	);
	path.setAttribute('fill', '#3D3D3D');

	svg.appendChild(path);

	return svg;
}

async function createArrowSVG(color = '#F6F6F6', width = '30px') {
	const svgElement = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'svg',
	);
	svgElement.setAttribute('id', 'icon');
	svgElement.setAttribute('width', width);
	svgElement.setAttribute('height', width);
	svgElement.setAttribute('viewBox', '0 0 1024 1024');
	svgElement.setAttribute('class', 'icon');

	const pathElement = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path',
	);
	pathElement.setAttribute(
		'd',
		'M917.333333 364.8L851.2 298.666667 512 637.866667 172.8 298.666667 106.666667 364.8 512 768z',
	);
	pathElement.setAttribute('fill', color);
	svgElement.appendChild(pathElement);
	return svgElement;
}

async function createBlockMark() {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '20');
	svg.setAttribute('height', '20');
	svg.setAttribute('viewBox', '0 0 40 40');
	svg.setAttribute('fill', 'none');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute(
		'd',
		'M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM4 20C4 11.16 11.16 4 20 4C23.7 4 27.1 5.26 29.8 7.38L7.38 29.8C5.26 27.1 4 23.7 4 20ZM20 36C16.3 36 12.9 34.74 10.2 32.62L32.62 10.2C34.74 12.9 36 16.3 36 20C36 28.84 28.84 36 20 36Z',
	);
	path.setAttribute('fill', '#C33232');

	svg.appendChild(path);

	return svg;
}
async function adjustFontSizeToFit(
	totalGainValue,
	boxWidthVW,
	originalSizeRem,
) {
	// Convert boxWidth from vw to px
	const boxWidthPx = (boxWidthVW / 100) * window.innerWidth;

	// Convert originalSize from rem to px
	const rootFontSize = parseFloat(
		getComputedStyle(document.documentElement).fontSize,
	);
	let fontSizePx = originalSizeRem * rootFontSize;

	const copy = totalGainValue.cloneNode(true);
	copy.style.width = 'auto';
	copy.style.fontSize = fontSizePx + 'px';
	copy.style.fontFamily = 'Inter';
	copy.style.whiteSpace = 'pre-line';

	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';

	container.appendChild(copy);
	document.body.appendChild(container);

	let width = copy.offsetWidth;
	while (width > boxWidthPx && fontSizePx > 0) {
		fontSizePx -= 1;
		copy.style.fontSize = fontSizePx + 'px';
		width = copy.offsetWidth;
	}

	document.body.removeChild(container);

	// Convert the adjusted fontSize from px to rem
	const fontSizeRem = fontSizePx / rootFontSize;
	return fontSizeRem;
}

function getCenterPosition(element) {
	const rect = element.getBoundingClientRect();

	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	return { x: centerX, y: centerY };
}
