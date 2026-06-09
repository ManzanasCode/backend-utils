import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import sharp from 'sharp';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Configure JSON parser with 50mb limit
app.use(express.json({ limit: '50mb' }));

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Interactive Web UI for testing
app.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vertical Image Merger Studio</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    header p {
      color: #94a3b8;
      font-size: 1.1rem;
    }
    main {
      width: 100%;
      max-width: 800px;
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    .dropzone {
      border: 2px dashed rgba(129, 140, 248, 0.4);
      border-radius: 16px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(15, 23, 42, 0.3);
      margin-bottom: 30px;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.05);
      transform: scale(1.01);
    }
    .dropzone svg {
      width: 48px;
      height: 48px;
      color: #818cf8;
      margin-bottom: 15px;
      transition: transform 0.3s ease;
    }
    .dropzone:hover svg {
      transform: translateY(-5px);
    }
    .dropzone p {
      font-size: 1.1rem;
      margin-bottom: 5px;
      color: #e2e8f0;
    }
    .dropzone span {
      font-size: 0.85rem;
      color: #64748b;
    }
    #fileInput {
      display: none;
    }
    .preview-container {
      margin-bottom: 30px;
    }
    .preview-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #cbd5e1;
      display: none;
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 15px;
    }
    .preview-card {
      position: relative;
      background: #0f172a;
      border-radius: 12px;
      padding: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .preview-card img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }
    .preview-card .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      transition: background 0.2s;
    }
    .preview-card .remove-btn:hover {
      background: #dc2626;
    }
    .preview-card .index-badge {
      position: absolute;
      bottom: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.8);
      color: #818cf8;
      padding: 2px 8px;
      font-size: 0.75rem;
      border-radius: 6px;
      font-weight: bold;
      border: 1px solid rgba(129, 140, 248, 0.3);
    }
    .action-btn {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .action-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }
    .action-btn:disabled {
      background: #475569;
      box-shadow: none;
      cursor: not-allowed;
      color: #94a3b8;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      display: none;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .result-container {
      margin-top: 40px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 40px;
      display: none;
      animation: fadeIn 0.5s ease;
    }
    .result-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: #a855f7;
    }
    .result-meta {
      font-size: 0.95rem;
      color: #94a3b8;
      margin-bottom: 20px;
      background: rgba(15, 23, 42, 0.4);
      padding: 12px 20px;
      border-radius: 8px;
      display: inline-block;
    }
    .result-image-wrapper {
      background: #0f172a;
      padding: 15px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 20px;
      text-align: center;
    }
    .result-image-wrapper img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #10b981;
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .download-btn:hover {
      background: #059669;
    }
    footer {
      margin-top: 40px;
      text-align: center;
      color: #64748b;
      font-size: 0.85rem;
    }
    footer a {
      color: #818cf8;
      text-decoration: none;
    }
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>Image Merger Studio</h1>
    <p>Une múltiples imágenes verticalmente en un collage de alta calidad</p>
  </header>

  <main>
    <div class="dropzone" id="dropzone">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <p>Arrastra y suelta tus imágenes aquí</p>
      <span>o haz clic para buscar archivos locales</span>
      <input type="file" id="fileInput" multiple accept="image/*">
    </div>

    <div class="preview-container">
      <div class="preview-title" id="previewTitle">Imágenes cargadas (Orden vertical)</div>
      <div class="preview-grid" id="previewGrid"></div>
    </div>

    <button class="action-btn" id="mergeBtn" disabled>
      <div class="spinner" id="btnSpinner"></div>
      <span id="btnText">Fusionar Imágenes (0)</span>
    </button>

    <div class="result-container" id="resultContainer">
      <div class="result-title">Resultado de la Fusión</div>
      <div id="resultMeta" class="result-meta"></div>
      <div class="result-image-wrapper">
        <img id="resultImg" src="" alt="Resultado del collage">
      </div>
      <a id="downloadBtn" class="download-btn" href="#" download="collage-result.jpg">
        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Descargar Collage (JPEG)
      </a>
    </div>
  </main>

  <footer>
    <p>Desarrollado con Node.js, TypeScript, Express y Sharp. Documentación interactiva en <a href="/api-docs">/api-docs</a></p>
  </footer>

  <script>
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const previewTitle = document.getElementById('previewTitle');
    const mergeBtn = document.getElementById('mergeBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');
    const resultContainer = document.getElementById('resultContainer');
    const resultImg = document.getElementById('resultImg');
    const resultMeta = document.getElementById('resultMeta');
    const downloadBtn = document.getElementById('downloadBtn');

    let loadedImages = [];

    // Trigger click on file input
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    function handleFiles(files) {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          loadedImages.push({
            name: file.name,
            base64: event.target.result
          });
          updateUI();
        };
        reader.readAsDataURL(file);
      }
    }

    function removeImage(index) {
      loadedImages.splice(index, 1);
      updateUI();
    }

    function updateUI() {
      // Clear grid
      previewGrid.innerHTML = '';
      
      if (loadedImages.length > 0) {
        previewTitle.style.display = 'block';
        mergeBtn.disabled = loadedImages.length < 2;
        btnText.textContent = \`Fusionar Imágenes (\${loadedImages.length})\`;
        
        loadedImages.forEach((img, idx) => {
          const card = document.createElement('div');
          card.className = 'preview-card';
          
          card.innerHTML = \`
            <img src="\${img.base64}" alt="\${img.name}">
            <button class="remove-btn" onclick="removeImage(\${idx})">&times;</button>
            <div class="index-badge">#\${idx + 1}</div>
          \`;
          
          previewGrid.appendChild(card);
        });
      } else {
        previewTitle.style.display = 'none';
        mergeBtn.disabled = true;
        btnText.textContent = 'Fusionar Imágenes (0)';
      }
    }

    mergeBtn.addEventListener('click', async () => {
      if (loadedImages.length < 2) return;

      // UI state loading
      mergeBtn.disabled = true;
      btnSpinner.style.display = 'block';
      btnText.textContent = 'Procesando collage...';
      resultContainer.style.display = 'none';

      const payload = {
        images: loadedImages.map(img => img.base64)
      };

      try {
        const response = await fetch('/merge-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          resultImg.src = \`data:image/jpeg;base64,\${data.result}\`;
          downloadBtn.href = \`data:image/jpeg;base64,\${data.result}\`;
          resultMeta.innerHTML = \`Ancho resultante: <strong>\${data.width}px</strong> | Alto resultante: <strong>\${data.height}px</strong>\`;
          resultContainer.style.display = 'block';
          
          // Smooth scroll to result
          resultContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
          alert('Error del servidor: ' + (data.error || 'Desconocido'));
        }
      } catch (err) {
        alert('Error de conexión: ' + err.message);
      } finally {
        mergeBtn.disabled = false;
        btnSpinner.style.display = 'none';
        btnText.textContent = \`Fusionar Imágenes (\${loadedImages.length})\`;
      }
    });
  </script>
</body>
</html>
  `);
});

// Health Check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Helper to clean base64 data prefix and return buffer.
// Supports standard data urls (e.g. data:image/png;base64,...) with robust MIME matching.
function base64ToBuffer(base64Str: string): Buffer {
  const cleanStr = base64Str.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  return Buffer.from(cleanStr, 'base64');
}

interface MergeImagesRequest {
  images?: string[];
}

// Merge images endpoint
app.post('/merge-images', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { images } = req.body as MergeImagesRequest;

    // Validation
    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: '"images" must be a non-empty array of base64 strings' });
      return;
    }

    for (let i = 0; i < images.length; i++) {
      if (typeof images[i] !== 'string' || images[i].trim() === '') {
        res.status(400).json({ error: `Image at index ${i} is not a valid base64 string` });
        return;
      }
    }

    // 1. Convert to buffers
    const buffers = images.map(base64ToBuffer);

    // 2. Get metadata in parallel to find maxWidth
    const metadataPromises = buffers.map(buf => sharp(buf).metadata());
    const metadatas = await Promise.all(metadataPromises);

    // 3. Find the maximum width
    const widths = metadatas.map(meta => meta.width || 0);
    const maxWidth = Math.max(...widths);

    if (maxWidth === 0) {
      res.status(400).json({ error: 'Could not determine the dimensions of the input images' });
      return;
    }

    // 4. Resize all images to maxWidth maintaining aspect ratio.
    // We use toBuffer({ resolveWithObject: true }) to retrieve both the output buffer 
    // and the info (including new height) in a single step, which is highly performant.
    const resizedImagesPromises = buffers.map(async (buf) => {
      const { data, info } = await sharp(buf)
        .resize({ width: maxWidth })
        .toBuffer({ resolveWithObject: true });
      
      return {
        buffer: data,
        height: info.height
      };
    });

    const resizedImages = await Promise.all(resizedImagesPromises);

    // 5. Calculate total height
    const totalHeight = resizedImages.reduce((sum, img) => sum + img.height, 0);

    // 6. Stack vertically using sharp composite
    let currentTop = 0;
    const compositeList = resizedImages.map(img => {
      const item = {
        input: img.buffer,
        top: currentTop,
        left: 0
      };
      currentTop += img.height;
      return item;
    });

    // Create a solid white background image (channels: 3) and composite all resized images onto it.
    // A white background is ideal for final JPEG conversions to prevent transparency turning black.
    const collageBuffer = await sharp({
      create: {
        width: maxWidth,
        height: totalHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite(compositeList)
      .jpeg({ quality: 92 })
      .toBuffer();

    // 7. Return the JPEG quality 92 in base64 along with final dimensions
    const resultBase64 = collageBuffer.toString('base64');

    res.json({
      result: resultBase64,
      width: maxWidth,
      height: totalHeight
    });
  } catch (error) {
    next(error);
  }
});

// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error occurred in API:', err);
  res.status(500).json({
    error: err.message || 'An unexpected error occurred during processing'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
