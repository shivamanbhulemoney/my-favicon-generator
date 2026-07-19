const upload = document.getElementById('upload');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');

let generatedIcons = {};

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            preview.innerHTML = ''; // Clear previous
            generatedIcons = {}; // Clear memory
            const sizes = [16, 32, 48, 192];
            
            sizes.forEach(size => {
                const dataUrl = resizeImage(img, size);
                generatedIcons[`icon-${size}.png`] = dataUrl;
                
                // Show preview
                const imgEl = document.createElement('img');
                imgEl.src = dataUrl;
                imgEl.title = `${size}x${size}`;
                preview.appendChild(imgEl);
            });
            downloadBtn.style.display = 'block';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Canvas resizing logic
function resizeImage(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, size, size);
    return canvas.toDataURL('image/png');
}

// Zip and Download logic
downloadBtn.addEventListener('click', async () => {
    const zip = new JSZip();
    
    for (const [filename, dataUrl] of Object.entries(generatedIcons)) {
        // Remove "data:image/png;base64," prefix
        const base64Data = dataUrl.split(',')[1];
        zip.file(filename, base64Data, {base64: true});
    }
    
    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "favicons.zip";
    link.click();
});
