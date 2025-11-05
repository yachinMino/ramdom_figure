const canvas = document.getElementById('floatingShapesCanvas');
const ctx = canvas.getContext('2d');

let shapes = [];
let globalHue = 0; // For dynamic background color changes

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle window resizing
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Function to generate a random color
// Function to generate a random color
function getRandomShapeColor(shapeHue) {
    return `hsla(${shapeHue}, 70%, 60%, ${shape.opacity})`;
}

// Function to generate a random shape (circle, polygon, or star)
function createShape() {
    const shapeTypes = ['circle', 'polygon', 'star'];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const initialSize = Math.random() * 240 + 120; // Min 120, Max 360 (double the previous max size)
    const speedMultiplier = Math.random() * 0.7 + 0.3; // Random speed multiplier (0.3 to 1.0, overall slower)
    const speedX = (Math.random() - 0.5) * 0.7 * speedMultiplier; // Base speed reduced to 0.7
    const speedY = (Math.random() - 0.5) * 0.7 * speedMultiplier; // Base speed reduced to 0.7
    const creationTime = Date.now();
    const minDisplayTime = 30000; // Minimum 30 seconds
    const disappearChance = 0.0005; // Reduced chance to disappear per frame (more increasing shapes)

    let shape = {
        type,
        x,
        y,
        size: initialSize,
        targetSize: initialSize,
        speedX,
        speedY,
        creationTime,
        minDisplayTime,
        disappearChance,
        sides: type === 'polygon' ? Math.floor(Math.random() * 3) + 3 : (type === 'star' ? Math.floor(Math.random() * 3) + 5 : 0), // 3 to 5 sides for polygons, 5 to 7 points for stars
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scaleX: 1,
        scaleY: 1,
        hue: (globalHue + Math.random() * 180) % 360,
        hueSpeed: (Math.random() - 0.5) * 0.5,
        opacity: 0,
        fadingOut: false,
        fadingIn: true
    };
    shapes.push(shape);
}

// Function to draw a shape
function drawShape(shape) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);

    ctx.fillStyle = `hsla(${shape.hue}, 70%, 60%, ${shape.opacity})`;
    ctx.beginPath();

    if (shape.type === 'circle') {
        ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
    } else if (shape.type === 'polygon') {
        const angleIncrement = (Math.PI * 2) / shape.sides;
        for (let i = 0; i < shape.sides; i++) {
            const angle = i * angleIncrement;
            const px = Math.cos(angle) * shape.size / 2;
            const py = Math.sin(angle) * shape.size / 2;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    } else if (shape.type === 'star') {
        const outerRadius = shape.size / 2;
        const innerRadius = outerRadius * (Math.random() * 0.3 + 0.4); // Inner radius 40-70% of outer
        const angleIncrement = Math.PI / shape.sides;
        for (let i = 0; i < shape.sides * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * angleIncrement;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
}

// Animation loop
function animate() {
    // Update background color (gradient)
    globalHue = (globalHue + 0.1) % 360;
    const pastelLightness = 70 + Math.sin(globalHue * Math.PI / 180) * 10; // 60% to 80% for pastel lightness
    const color1 = `hsl(${globalHue}, 70%, ${pastelLightness}%)`;
    const color2 = `hsl(${(globalHue + 60) % 360}, 70%, ${pastelLightness}%)`;

    let gradient;
    let x0, y0, x1, y1;

    // Random gradient direction (changes less frequently for smoother transitions)
    if (Date.now() % 10000 < 16) { // Change direction every ~10 seconds
        const direction = Math.floor(Math.random() * 4); // 0: top-left to bottom-right, 1: top-right to bottom-left, 2: top to bottom, 3: left to right
        switch (direction) {
            case 0: x0 = 0; y0 = 0; x1 = canvas.width; y1 = canvas.height; break;
            case 1: x0 = canvas.width; y0 = 0; x1 = 0; y1 = canvas.height; break;
            case 2: x0 = canvas.width / 2; y0 = 0; x1 = canvas.width / 2; y1 = canvas.height; break;
            case 3: x0 = 0; y0 = canvas.height / 2; x1 = canvas.width; y1 = canvas.height / 2; break;
        }
        canvas.dataset.gradientDirection = JSON.stringify({ x0, y0, x1, y1 }); // Store direction for consistent redraw
    } else {
        const storedDirection = JSON.parse(canvas.dataset.gradientDirection || '{"x0":0,"y0":0,"x1":' + canvas.width + ',"y1":' + canvas.height + '}');
        x0 = storedDirection.x0; y0 = storedDirection.y0; x1 = storedDirection.x1; y1 = storedDirection.y1;
    }

    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];

        // Fade-in logic
        if (shape.fadingIn) {
            shape.opacity += 0.02;
            if (shape.opacity >= 1) {
                shape.opacity = 1;
                shape.fadingIn = false;
            }
        }

        // Fade-out logic
        if (shape.fadingOut) {
            shape.opacity -= 0.02;
            if (shape.opacity <= 0) {
                shapes.splice(i, 1);
                i--; // Adjust index after removal
                continue;
            }
        }

        // Update position
        shape.x += shape.speedX;
        shape.y += shape.speedY;

        // Bounce off walls (using just shape.size as scaleX/Y are 1)
        if (shape.x + shape.size / 2 > canvas.width || shape.x - shape.size / 2 < 0) {
            shape.speedX *= -1;
        }
        if (shape.y + shape.size / 2 > canvas.height || shape.y - shape.size / 2 < 0) {
            shape.speedY *= -1;
        }

        // Update size
        if (Date.now() % 5000 < 16) { // Change target size every ~5 seconds (less frequent)
            shape.targetSize = Math.random() * 240 + 120; // Min 120, Max 360
        }
        shape.size += (shape.targetSize - shape.size) * 0.02; // Slower smooth size transition
        // Aspect ratio is fixed, so no scaleX/Y updates

        // Update rotation for polygons and stars
        if (shape.type === 'polygon' || shape.type === 'star') {
            shape.rotation += shape.rotationSpeed;
        }

        // Update shape color
        shape.hue = (shape.hue + shape.hueSpeed) % 360;
        if (shape.hue < 0) shape.hue += 360; // Ensure hue stays positive

        // Random disappearance after minimum display time
        if (!shape.fadingOut && Date.now() - shape.creationTime > shape.minDisplayTime) {
            if (Math.random() < shape.disappearChance) {
                shape.fadingOut = true; // Start fading out
            }
        }

        drawShape(shape);
    }

    // Add new shapes if there are less than a certain number (increased quantity)
    if (shapes.length < 50) { // Increased from 20 to 50 to fill the screen
        createShape();
    }

    requestAnimationFrame(animate);
}

// Initial shape creation (increased quantity)
for (let i = 0; i < 20; i++) { // Increased from 10 to 20
    createShape();
}

animate();
