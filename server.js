const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const htmlForm = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kompresi Foto</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .drop-zone {
            width: 300px;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 2px dashed #007bff;
            border-radius: 10px;
            cursor: pointer;
            color: #bdbdbd;
            font-size: 16px;
        }
        .drop-zone:hover {
            background-color: #e7f5ff;
        }
        .drop-zone input {
            display: none;
        }
        .drop-zone p {
            margin: 0;
            font-weight: bold;
        }
        button {
            width: 100%;
            margin-top: 20px;
            padding: 10px 24px;
            border: none;
            border-radius: 5px;
            background-color: #007bff;
            color: #ffffff;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0056b3;
        }
        @media (max-width: 480px) {
            .container {
                width: 95%;
            }
            .drop-zone {
                height: 150px;
            }
            button {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
<center>
<container>
    <form id="uploadForm" action="/upload" method="post" enctype="multipart/form-data">
        <div class="drop-zone" onclick="document.querySelector('.drop-zone input[type=file]').click();">
            <span class="drop-zone__prompt">
                <p>Select Your File</p>
            </span>
            <input type="file" name="photo" required>
        </div>        
        <button type="submit">Upload & Compress</button>
    </form>
    <script>
        document.querySelector('.drop-zone input').addEventListener('change', function() {
            document.querySelector('.drop-zone p').innerText = this.files[0].name;
        });

        const dropZoneElement = document.querySelector('.drop-zone');

        dropZoneElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneElement.classList.add('drop-zone--over');
        });

        ['dragleave', 'dragend'].forEach(type => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove('drop-zone--over');
            });
        });

        dropZoneElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
                dropZoneElement.querySelector('input').files = e.dataTransfer.files;
                document.querySelector('.drop-zone p').innerText = e.dataTransfer.files[0].name;
            }
            dropZoneElement.classList.remove('drop-zone--over');
        });
    </script>
    </container>
    </center>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlForm);
});

app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
        const format = req.file.mimetype === 'image/png' ? 'png' : 'jpeg';
        const quality = 20;

        const compressed = await sharp(req.file.buffer)
            .toFormat(format, { quality: quality })
            .toBuffer();

        const originalName = req.file.originalname;
        const newName = 'compressed_' + originalName;

        res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${newName}"`,
            'Content-Type': `image/${format}`
        });
        res.end(compressed);
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengompresi file.');
    }
});

const port = 3000;
app.listen(port, () => console.log(`Server berjalan di port ${port}`));
