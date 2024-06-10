// Initialize Notyf for notifications
const notyf = new Notyf({
    position: {
        x: 'left',
        y: 'top'
    },
    dismissible: true,
    duration: 3000,
});

let files = []; // Array to hold the files
// Variable to keep track if the file dialog box has been opened
let isFileDialogOpened = false;


const dropZoneClickListener = (event) => {
    if (!isFileDialogOpened) {
        // Prevent the default behavior
        event.preventDefault();
        const fileInput = document.getElementById('sqliteFile');
        fileInput.onchange = () => {
            const selectedFile = fileInput.files[0];
            if (files.includes(selectedFile.name)) {
                alert('This file has already been added.');
                return;
            }
            files.push(selectedFile.name);
        };
        fileInput.click();
        isFileDialogOpened = true;
        // Remove the click event listener from the dropZone
        document.getElementById('dropZone').removeEventListener('click', dropZoneClickListener);
    }
};
// Event listener for click on drop zone to trigger file input click
document.getElementById('dropZone').addEventListener('click', dropZoneClickListener);

// Event listener for file input change
document.getElementById('sqliteFile').addEventListener('change', (event) => {
    handleFiles(event.target.files);
});

// Event listener for drag over on drop zone
document.getElementById('dropZone').addEventListener('dragover', (event) => {
    event.preventDefault();
    document.getElementById('dropZone').classList.add('dragover');
});

// Event listener for drag leave on drop zone
document.getElementById('dropZone').addEventListener('dragleave', (event) => {
    document.getElementById('dropZone').classList.remove('dragover');
});

// Event listener for drop event on drop zone
document.getElementById('dropZone').addEventListener('drop', (event) => {
    event.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
    handleFiles(event.dataTransfer.files);
});

// Function to handle file selection and avoid duplicates
function handleFiles(droppedFiles) {
  
    for (let file of droppedFiles) {
        if (!file.name.match(/\.(db3|sqlite3?|db)$/i)) {
            notyf.error('Invalid file type. Please select an SQLite file.');
            continue;
        }
        if (!files.some(existingFile => existingFile.name === file.name)) {
            files.push(file);
            updateFileList();
        } else {
            notyf.info(`File ${file.name} is already added.`);
        }
    }
}

// Function to update file list display
function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    files.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.onclick = () => {
            files.splice(index, 1);
            updateFileList();
        };
        listItem.appendChild(removeButton);
        fileList.appendChild(listItem);
    });
}

// Function to load and convert the selected files
async function loadAndConvert() {
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const statusMessage = document.getElementById('statusMessage');
    const tableList = document.getElementById('tableList');

    if (files.length === 0) {
        notyf.warning('Please select an SQLite file first!');
        return;
    }

    // Process each file
    for (let file of files) {
        statusMessage.textContent = `Processing file ${file.name}...`;
        progress.style.display = "inline";
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';

        try {
            const fileBuffer = await file.arrayBuffer();
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/${file}`
            });

            const db = new SQL.Database(new Uint8Array(fileBuffer));
            const results = db.exec("SELECT name FROM sqlite_master WHERE type='table';");

            if (results[0] && results[0].values.length > 0) {
                const tableNames = results[0].values.flat();
                let completedTables = 0;
                
                // Create a sublist for this file
                const fileListItem = document.createElement('li');
                fileListItem.textContent = file.name;
                const sublist = document.createElement('ul');
                fileListItem.appendChild(sublist);
                tableList.appendChild(fileListItem);

                for (let tableName of tableNames) {
                    try {
                        const tableResults = db.exec(`SELECT * FROM \`${tableName}\``);
                        if (tableResults.length > 0 && tableResults[0].values.length > 0) {
                            const columns = tableResults[0].columns;
                            const values = tableResults[0].values;
                            const data = [columns, ...values];
                            const csv = Papa.unparse(data);
                            downloadCSV(csv, `${tableName}.csv`);
                        }
                        completedTables++;
                        const progressPercent = (completedTables / tableNames.length) * 100;
                        progressBar.style.width = `${progressPercent}%`;
                        progressBar.textContent = `${progressPercent.toFixed(0)}%`;
                        statusMessage.textContent = `Converting table ${completedTables}/${tableNames.length} in file ${file.name}...`;
                        updateTableList(tableName, sublist);
                    } catch (error) {
                        console.error(`Error processing table ${tableName}: ${error}`);
                        notyf.error(`Failed to process table ${tableName}.`);
                    }
                }
                statusMessage.textContent = `Conversion complete for file ${file.name}. ${completedTables}/${tableNames.length} tables converted.`;
                notyf.success(`Conversion complete for file ${file.name}. ${completedTables}/${tableNames.length} tables converted.`);
            } else {
                statusMessage.textContent = `No tables found in the database for file ${file.name}.`;
                notyf.info(`No tables found in the database for file ${file.name}.`);
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}: ${error}`);
            statusMessage.textContent = `Failed to process the file ${file.name}.`;
            notyf.error(`Failed to process the file ${file.name}.`);
        }
    }

    // Remove all processed files
    files = [];
    
    updateFileList();

    // Hide the progress bar after processing all files
    setTimeout(() => {
        progress.style.display = "none";
    }, 3000);
}

// Function to download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to update table list in the UI
function updateTableList(tableName, sublist) {
    const listItem = document.createElement('li');
    listItem.textContent = tableName;
    sublist.appendChild(listItem);
}
//reload page
 function reloadPage() {
            location.reload();
        }
