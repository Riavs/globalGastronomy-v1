function addCommentProgrammatically(name, commentText, date) {
    // Use the provided date or default to the current date if not provided
    const commentDate = date ? new Date(date) : new Date();
    const formattedDate = commentDate.toISOString(); // Format the date to ISO string

    // Create a new comment object
    const newComment = {
        name: name.trim(),
        date: formattedDate,
        text: commentText.trim()
    };

    // Add the new comment to the array
    comments.push(newComment);

    // Sort comments by date (newest first)
    comments.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update local storage
    localStorage.setItem('comments', JSON.stringify(comments));

    // Update the total comments counter
    totalCommentsSpan.textContent = comments.length;

    // Reset displayed comments count
    displayedCommentsCount = 0;

    // Clear the comments container and re-render comments
    commentsContainer.innerHTML = '';
    renderComments();

    // Optionally display a message to indicate success
    console.log("Comment added successfully!");
}



// Function to load comments from a JSON file
function loadCommentsFromJSON(filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(comment => {
                // Add each comment from the JSON file with a specific date
                addCommentProgrammatically(comment.name, comment.text, comment.date);
            });
            console.log("Comments loaded from JSON successfully.");
        })
        .catch(error => {
            console.error('Error loading comments from JSON:', error);
        });
}

// Call the function to load comments from the JSON file
loadCommentsFromJSON('comments.json');