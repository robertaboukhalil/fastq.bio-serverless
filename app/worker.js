var API_URL = "http://API-GOES-HERE";  // your serverless function URL goes here
var CHUNK_SIZE = 200e3;

// Process messages sent to this worker
// (inside WebWorkers, we represent the scope using self instead of window)
self.onmessage = msg =>
{
    console.log("[Worker] Received message:", msg.data);

    // Initialize
    var file = msg.data.file;
    var reader = new FileReaderSync();
    var nbChunks = Math.floor(file.size / CHUNK_SIZE);
    var chunks = [...Array(nbChunks).keys()];

    // Fetch metrics for several chunks
    for(var i = 0; i < 20; i++)
    {
        try {
            // Choose a chunk at random and remove it from array
            var chunkID = chunks.splice(Math.floor(Math.random() * chunks.length), 1)[0],
                chunkStart = chunkID * CHUNK_SIZE,
                chunkEnd = chunkID * CHUNK_SIZE + CHUNK_SIZE;

            // Read chunk of file (synchronously!)
            var chunk = reader.readAsBinaryString(file.slice(chunkStart, chunkEnd)).split("\n");

            // Go to next valid FASTQ chunk (assume not sampling from beginning of line)
            //   - Header line must start with @
            //   - Sequence and quality lines must be of equal lengths
            while(!chunk[0].match(/^@/) || chunk[1].length != chunk[3].length)
            chunk.shift();

            // Use multiples of 4 (and remove 4 more in case they were truncated)
            chunk = chunk.slice(0, chunk.length - (chunk.length%4) - 4);

            // Parse metrics and send back info to main thread
            console.log(`[${chunkID}] Processing chunk...`);
            getMetrics(chunk.join("\n"), chunkID);
        } catch (error) {
            console.log(`[${chunkID}] Error parsing chunk: ${error}`);
            self.postMessage(null);
            continue;
        }
    }
};

// Return metrics
function getMetrics(fastq, id)
{
    var request = new XMLHttpRequest();
    request.open("POST", API_URL, true);  // false => synchronous request
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.responseType = "json";

    request.onload = e => {
        console.log(`[${id}] Done`);
        self.postMessage(request.response);
    };

    console.log(`[${id}] Sending...`);
    request.send(`sequence=${encodeURIComponent(fastq)}`);
}
