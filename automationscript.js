let companiesData = {}; // Store data for multiple companies
let currentCompany = '';

function generateOutputs() {
    const reviewsInput = document.getElementById('reviews-input').value;
    const reviewLink = document.getElementById('review-link').value;
    const reviews = reviewsInput.split(/\n\n/);  // Splits on blank lines
    const outputContainer = document.getElementById('output-container');
    outputContainer.innerHTML = '';

    reviews.forEach((review, index) => {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        outputDiv.id = `output-${index}`;

        // Link display
        const linkElement = document.createElement('p');
        linkElement.innerHTML = `Click: <a href="${reviewLink}" target="_blank">${reviewLink}</a>`;
        outputDiv.appendChild(linkElement);

        // Review text
        const reviewElement = document.createElement('p');
        reviewElement.textContent = review;
        outputDiv.appendChild(reviewElement);

        // Copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-btn';
        copyButton.textContent = 'Copy';
        copyButton.onclick = () => {
            copyToClipboard(`Click: ${reviewLink}\n\n${review}`);
            markAsDone(outputDiv); // Automatically mark as done after copying
            updateStats();         // Update stats after marking as done
        };
        outputDiv.appendChild(copyButton);

        outputContainer.appendChild(outputDiv);
    });

    updateStats();  // Call stats update after generating output
}

function copyToClipboard(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
}

function markAsDone(outputDiv) {
    outputDiv.classList.add('done');
}

function updateStats() {
    const totalReviews = document.getElementsByClassName('output').length;
    const doneReviews = document.getElementsByClassName('done').length;
    const statsContainer = document.getElementById('stats-container');
    statsContainer.textContent = `Total Reviews: ${totalReviews} | Done Reviews: ${doneReviews}`;
}

function downloadJSON() {
    const outputDivs = document.querySelectorAll('.output');
    const reviewData = Array.from(outputDivs).map((outputDiv) => {
        return {
            reviewText: outputDiv.querySelector('p:nth-child(2)').textContent,
            reviewLink: outputDiv.querySelector('a').href,
            status: outputDiv.classList.contains('done') ? 'done' : 'undone'
        };
    });

    const data = JSON.stringify(reviewData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'reviews.json';
    a.click();

    URL.revokeObjectURL(url);
}

function loadFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const jsonContent = JSON.parse(e.target.result);
        const outputContainer = document.getElementById('output-container');
        outputContainer.innerHTML = '';  // Clear previous output

        jsonContent.forEach((item, index) => {
            const outputDiv = document.createElement('div');
            outputDiv.className = 'output';
            outputDiv.id = `output-${index}`;

            if (item.status === 'done') {
                outputDiv.classList.add('done');
            }

            // Link display
            const linkElement = document.createElement('p');
            linkElement.innerHTML = `Click: <a href="${item.reviewLink}" target="_blank">${item.reviewLink}</a>`;
            outputDiv.appendChild(linkElement);

            // Review text
            const reviewElement = document.createElement('p');
            reviewElement.textContent = item.reviewText;
            outputDiv.appendChild(reviewElement);

            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-btn';
            copyButton.textContent = 'Copy';
            copyButton.onclick = () => {
                copyToClipboard(`Click: ${item.reviewLink}\n\n${item.reviewText}`);
                markAsDone(outputDiv); // Automatically mark as done after copying
                updateStats();         // Update stats after marking as done
            };
            outputDiv.appendChild(copyButton);

            outputContainer.appendChild(outputDiv);
        });

        // Ensure the review link field is also populated
        if (jsonContent.length > 0) {
            document.getElementById('review-link').value = jsonContent[0].reviewLink;
        }

        updateStats();  // Update stats after loading file
    };

    if (file) {
        reader.readAsText(file);
    }
}

/**
 *  New function to copy the latest undone review.
 *  If found, it copies "Click: {link}\n\n{reviewText}" to the clipboard,
 *  then marks that review as done and updates the stats.
 */
function copyLatestUndoneReview() {
    // Grab all reviews that are NOT marked "done"
    const undoneReviews = document.querySelectorAll('.output:not(.done)');
    if (undoneReviews.length > 0) {
        // “Latest” undone can be interpreted in various ways:
        // Option 1: The first undone in the list
        const latestUndoneReview = undoneReviews[0];

        // Option 2: The last undone in the list
        // const latestUndoneReview = undoneReviews[undoneReviews.length - 1];

        const linkElement = latestUndoneReview.querySelector('a');
        const reviewElement = latestUndoneReview.querySelector('p:nth-child(2)');

        const link = linkElement ? linkElement.href : '';
        const reviewText = reviewElement ? reviewElement.textContent : '';

        copyToClipboard(`Click: ${link}\n\n${reviewText}`);
        markAsDone(latestUndoneReview);
        updateStats();
    } else {
        alert('No undone reviews available to copy!');
    }
}
