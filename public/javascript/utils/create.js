function createDOMElement(tag, className = '', content = '', type = '') {
	const element = document.createElement(tag);

	if (className) element.classList.add(className);

	if (content !== '') element.textContent = content;

	if (tag == 'input') element.placeholder = content;

	if (type !== '') element.type = type;

	return element;
}

async function createImageElement(src, alt, className = '') {
	const image = new Image();

	try {
		const isWebp = src.toLowerCase().endsWith('.webp');
		let blob;

		if (isWebp) {
			// Only use Cache API for .webp files
			const cache = await caches.open('images-cache');
			const cachedResponse = await cache.match(src);

			if (cachedResponse) {
				blob = await cachedResponse.blob();
			} else {
				const response = await fetch(src, { cache: 'default' });
				if (!response.ok) throw new Error(`Failed to fetch ${src}: ${response.status}`);

				await cache.put(src, response.clone());
				blob = await response.blob();
			}
		} else {
			// Force re-fetch for non-.webp files (no local caching)
			const response = await fetch(`${src}?v=${Date.now()}`, { cache: 'reload' });
			if (!response.ok) throw new Error(`Failed to fetch ${src}: ${response.status}`);

			blob = await response.blob();
		}

		// Create object URL from blob
		image.src = URL.createObjectURL(blob);
		image.alt = alt;
		if (className) image.classList.add(className);

		// Revoke blob URL after image is fully loaded
		const blobUrl = image.src;
		image.onload = () => {
			console.log(`Image loaded from: ${blobUrl}`);
			// Optionally revoke after some time: setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
		};

		await new Promise((resolve, reject) => {
			image.onload = resolve;
			image.onerror = reject;
		});
	} catch (error) {
		console.error('Error fetching image:', error);
		return null;
	}

	return image;
}

async function loadEditableSVGFile(filePath, className) {
	try {
		const response = await fetch(filePath);
		const svgData = await response.text();

		// Sanitize the SVG content using DOMPurify
		const sanitizedSvgData = DOMPurify.sanitize(svgData, {
			ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'g', 'text', 'polygon'], // You can specify which tags to allow
			ALLOWED_ATTR: ['id', 'class', 'd', 'fill', 'stroke', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'viewBox'], // List allowed attributes
		});

		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgElement.innerHTML = sanitizedSvgData;

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
	try {
		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgElement.setAttribute('id', 'checked-icon');
		svgElement.setAttribute('width', width);
		svgElement.setAttribute('height', width);
		svgElement.setAttribute('viewBox', '0 0 40 40');
		svgElement.setAttribute('class', 'checked');
		svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

		const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		pathElement.setAttribute(
			'd',
			'M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L6 20L8.82 17.18L16 24.34L31.18 9.16L34 12L16 30Z'
		);
		pathElement.setAttribute('fill', color);

		svgElement.appendChild(pathElement);

		// Ensure the SVG element is properly sanitized
		const sanitizedSvgString = DOMPurify.sanitize(svgElement.outerHTML);
		const sanitizedSvgElement = new DOMParser().parseFromString(sanitizedSvgString, 'image/svg+xml').documentElement;

		return sanitizedSvgElement;
	} catch (error) {
		console.error('Error creating check mark SVG:', error);
		return null;
	}
}

async function createUncheckMark(color = '#3D3D3D', width = '40') {
	try {
		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgElement.setAttribute('id', 'unchecked-icon');
		svgElement.setAttribute('width', width);
		svgElement.setAttribute('height', width);
		svgElement.setAttribute('viewBox', '0 0 40 40');
		svgElement.setAttribute('class', 'unchecked');
		svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

		const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		pathElement.setAttribute(
			'd',
			'M20 2C10.06 2 2 10.06 2 20C2 29.94 10.06 38 20 38C29.94 38 38 29.94 38 20C38 10.06 29.94 2 20 2ZM20 34C11.72 34 6 28.28 6 20C6 11.72 11.72 6 20 6C28.28 6 34 11.72 34 20C34 28.28 28.28 34 20 34Z'
		);
		pathElement.setAttribute('fill', color);

		svgElement.appendChild(pathElement);

		// Ensure the SVG element is properly sanitized
		const sanitizedSvgString = DOMPurify.sanitize(svgElement.outerHTML);
		const sanitizedSvgElement = new DOMParser().parseFromString(sanitizedSvgString, 'image/svg+xml').documentElement;

		return sanitizedSvgElement;
	} catch (error) {
		console.error('Error creating uncheck mark SVG:', error);
		return null;
	}
}

async function createArrowSVG(color = '#F6F6F6', width = '30px') {
	try {
		// Build the SVG as a string
		const rawSvg = `
			<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 1024 1024" class="icon">
				<path d="M917.333333 364.8L851.2 298.666667 512 637.866667 172.8 298.666667 106.666667 364.8 512 768z" fill="${color}" />
			</svg>
		`;

		// Sanitize the SVG string
		const sanitizedSvgString = DOMPurify.sanitize(rawSvg, { SAFE_FOR_SVG: true });

		// Convert sanitized string back to an SVG element
		const parsedSvg = new DOMParser().parseFromString(sanitizedSvgString, 'image/svg+xml');
		const sanitizedSvgElement = parsedSvg.documentElement;

		return sanitizedSvgElement;
	} catch (error) {
		console.error('Error creating sanitized arrow SVG:', error);
		return null;
	}
}

async function createBlockMark() {
	try {
		const rawSvg = `
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 40 40" fill="none">
				<path d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM4 20C4 11.16 11.16 4 20 4C23.7 4 27.1 5.26 29.8 7.38L7.38 29.8C5.26 27.1 4 23.7 4 20ZM20 36C16.3 36 12.9 34.74 10.2 32.62L32.62 10.2C34.74 12.9 36 16.3 36 20C36 28.84 28.84 36 20 36Z" fill="#C33232"/>
			</svg>
		`;

		// Sanitize the SVG string
		const sanitizedSvgString = DOMPurify.sanitize(rawSvg, { SAFE_FOR_SVG: true });

		// Convert sanitized string back to an SVG element
		const parsedSvg = new DOMParser().parseFromString(sanitizedSvgString, 'image/svg+xml');
		const sanitizedSvgElement = parsedSvg.documentElement;

		return sanitizedSvgElement;
	} catch (error) {
		console.error('Error creating sanitized block mark SVG:', error);
		return null;
	}
}

async function adjustFontSizeToFit(totalGainValue, boxWidthVW, originalSizeRem) {
	// Convert boxWidth from vw to px
	const boxWidthPx = (boxWidthVW / 100) * window.innerWidth;

	// Convert originalSize from rem to px
	const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
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
