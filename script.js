const dropZone = document.getElementById('drop-zone');
const upload = document.getElementById('upload');
const preview = document.getElementById('preview-grid');
const downloadBtn = document.getElementById('downloadBtn');

dropZone.onclick = () => upload.click();
upload.onchange = (e) => handleImage(e.target.files[0]);

async function handleImage(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async () => {
            preview.innerHTML = '';
            const sizes = [16, 32, 48, 192];
            const blobs = {};

            for (const size of sizes) {
                const blob = await resizeCanvas(img, size);
                blobs[`icon-${size}.png`] = blob;
                
                // Show preview
                const url = URL.createObjectURL(blob);
                const imgEl = document.createElement('img');
                imgEl.src = url;
                preview.appendChild(imgEl);
            }
            downloadBtn.style.display = 'inline-block';
            downloadBtn.dataset.blobs = JSON.stringify(blobs);
        };
    };
    reader.readAsDataURL(file);
}

function resizeCanvas(img, size) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(img, 0, 0, size, size);
        canvas.toBlob(resolve, 'image/png');
    });
}

downloadBtn.onclick = async () => {
    const zip = new JSZip();
    const blobs = JSON.parse(downloadBtn.dataset.blobs);
    
    for (const [name, blob] of Object.entries(blobs)) {
        zip.file(name, blob);
    }
    
    const content = await zip.generateAsync({type: "blob"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "my-favicon-pack.zip";
    link.click();
};
