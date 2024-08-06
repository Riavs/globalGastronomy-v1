document.addEventListener("DOMContentLoaded", function () {
    const totalCommentsSpan = document.getElementById("total-comments");
    const commentsContainer = document.getElementById("commentsContainer");
    const showMoreBtn = document.getElementById("showMoreBtn");
    const sortCommentsSelect = document.getElementById("sortComments");
    const button = document.getElementById("animatedButton");
    const buttonText = button.querySelector(".button-text");
    const thankYouMessage = document.getElementById("thankYouMessage");

    let comments = [];
    let displayedCommentsCount = 0;
    const commentsPerPage = 5;

    // Validate Email
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    // Validate Inputs
    function validateInputs() {
        let isValid = true;

        const emailInput = document.getElementById("emailInput");
        const nameInput = document.getElementById("nameInput");
        const commentInput = document.getElementById('commentTextInput');

        // Validate email
        const emailFormFloating = emailInput.closest('.form-floating');
        if (validateEmail(emailInput.value)) {
            emailFormFloating.classList.remove('is-invalid');
            emailInput.classList.remove('is-invalid');
            emailFormFloating.classList.add('is-valid');
            emailInput.classList.add('is-valid');
        } else {
            emailFormFloating.classList.add('is-invalid');
            emailInput.classList.add('is-invalid');
            emailFormFloating.classList.remove('is-valid');
            emailInput.classList.remove('is-valid');
            isValid = false;
        }

        // Validate name
        const nameFormFloating = nameInput.closest('.form-floating');
        if (nameInput.value.trim()) {
            nameFormFloating.classList.remove('is-invalid');
            nameInput.classList.remove('is-invalid');
            nameFormFloating.classList.add('is-valid');
            nameInput.classList.add('is-valid');
        } else {
            nameFormFloating.classList.add('is-invalid');
            nameInput.classList.add('is-invalid');
            nameFormFloating.classList.remove('is-valid');
            nameInput.classList.remove('is-valid');
            isValid = false;
        }

        // Validate Comment
        if (!commentInput.value) {
            commentInput.classList.add('is-invalid');
            isValid = false;
        } else {
            commentInput.classList.remove('is-invalid');
            commentInput.classList.add('is-valid');
        }

        return isValid;
    }
    
     // Reset Validation
     function resetValidation() {
        const emailInput = document.getElementById("emailInput");
        const nameInput = document.getElementById("nameInput");
        const commentInput = document.getElementById("commentTextInput");

        emailInput.classList.remove('is-valid', 'is-invalid');
        nameInput.classList.remove('is-valid', 'is-invalid');
        commentInput.classList.remove('is-valid', 'is-invalid');

        const emailFormFloating = emailInput.closest('.form-floating');
        const nameFormFloating = nameInput.closest('.form-floating');

        emailFormFloating.classList.remove('is-valid', 'is-invalid');
        nameFormFloating.classList.remove('is-valid', 'is-invalid');
    }

    // Format Date for Display
    function formatDate(date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-GB', options).replace(/\//g, '-');

        // Calculate difference
        const now = new Date();
        const timeDiff = now - date;

        const diffMinutes = Math.floor(timeDiff / (1000 * 60));
        const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const diffMonths = now.getMonth() - date.getMonth() + (now.getFullYear() - date.getFullYear()) * 12;
        const diffYears = Math.floor(diffMonths / 12);

        let timeAgo = '';
        if (diffDays < 1) {
            if (diffHours < 1) {
                timeAgo = diffMinutes < 1 ? 'Just now' : `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            } else {
                timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            }
        } else if (diffDays < 30) {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffMonths < 12) {
            timeAgo = `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else {
            timeAgo = `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        }

        return `${formattedDate} (${timeAgo})`;
    }

    // Render Comments
    function renderComments() {
        const start = displayedCommentsCount;
        const end = Math.min(displayedCommentsCount + commentsPerPage, comments.length);

        for (let i = start; i < end; i++) {
            const { name, date, text } = comments[i];
            const commentDate = new Date(date);

            // Create a new comment element
            const newCommentDiv = document.createElement("div");
            newCommentDiv.classList.add("comment");
            newCommentDiv.innerHTML = `
                <div class="row align-items-center justify-content-between comment-top"">
                    <div class="col-9">
                        <p class="comment-meta"><strong>${name}</strong> | Posted on ${formatDate(commentDate)}</p>
                    </div>
                    <div class="col-3 text-end text-nowrap">
                        <button class="delete-button">Delete</button>
                    </div>
                </div>
                <p>${text}</p>
            `;

            // Add the date as a data attribute
            newCommentDiv.setAttribute('data-date', commentDate.toISOString());

            // Append the new comment to the comments container
            commentsContainer.appendChild(newCommentDiv);

            // Add event listener for delete button
            const deleteButton = newCommentDiv.querySelector('.delete-button');
            deleteButton.addEventListener('click', function () {
                deleteComment(newCommentDiv);
            });
        }

        displayedCommentsCount += commentsPerPage;

        // Toggle the "Show More" button activity
        showMoreBtn.disabled = displayedCommentsCount >= comments.length;
    }

    // Save Comments to Local Storage
    function saveComments() {
        const commentsData = [];
        document.querySelectorAll('.comment').forEach(comment => {
            const name = comment.querySelector('strong').textContent;
            const date = comment.getAttribute('data-date');
            const text = comment.querySelector('p:last-of-type').textContent;
            commentsData.push({ name, date, text });
        });
        localStorage.setItem('comments', JSON.stringify(commentsData));
    }

    // Load Comments from Local Storage
    function loadComments() {
        comments = JSON.parse(localStorage.getItem('comments')) || [];
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        totalCommentsSpan.textContent = comments.length;
        displayedCommentsCount = 0; // Reset the displayed comments count
        commentsContainer.innerHTML = ''; // Clear comments container
        renderComments();

        // Set the initial state of the "Show More" button
        showMoreBtn.disabled = comments.length <= commentsPerPage;
    }

    // Add a New Comment
    function addComment() {
        const nameInput = document.getElementById("nameInput");
        const commentTextInput = document.getElementById("commentTextInput");

        // Get user input values
        const name = nameInput.value.trim();
        const commentText = commentTextInput.value.trim();
        const currentDate = new Date();

        if (name && commentText) {
            const newComment = {
                name,
                date: currentDate.toISOString(),
                text: commentText
            };
            comments.push(newComment);
            comments.sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem('comments', JSON.stringify(comments));
            totalCommentsSpan.textContent = comments.length;
            displayedCommentsCount = 0; // Reset displayed comments count
            commentsContainer.innerHTML = ''; // Clear comments container
            renderComments();

            // Show thank-you message
            thankYouMessage.classList.remove('d-none');

            // Clear input fields
            emailInput.value = "";
            nameInput.value = "";
            commentTextInput.value = "";

            // Reset validation
            resetValidation(); 
            
        }
    }

    // Alert made using SweetAlert2
    function deleteComment(commentDiv) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const date = commentDiv.getAttribute('data-date');
                comments = comments.filter(comment => comment.date !== date);
                localStorage.setItem('comments', JSON.stringify(comments));
                totalCommentsSpan.textContent = comments.length;
                displayedCommentsCount = 0; // Reset displayed comments count
                commentsContainer.innerHTML = ''; // Clear comments container
                renderComments();
                Swal.fire(
                    'Deleted!',
                    'Your comment has been deleted.',
                    'success'
                );
            }
        });
    }

    // Button Animation made using Anime.js
    // Define the animation function
    function animateButton() {
        // Add class to shrink the button
        button.classList.add("shrink");

        // Animate the button shrinking and check icon fade-in
        anime({
            targets: button,
            scale: [1, 0.3], // Shrinks button to 30% of its size
            duration: 400,
            easing: 'easeInOutQuad',
            complete: function () {
                // Animation for text fade-out
                anime({
                    targets: buttonText,
                    opacity: [1, 0],
                    duration: 400,
                    easing: 'easeInOutQuad',
                    complete: function () {
                        buttonText.style.display = "none";
                        // Add check icon
                        const checkIcon = document.createElement("span");
                        checkIcon.classList.add("checkIcon");
                        checkIcon.innerHTML = '<i class="fa-solid fa-check fa-lg"></i>';
                        button.appendChild(checkIcon);

                        // Fade in the check icon
                        anime({
                            targets: checkIcon,
                            opacity: [0, 1],

                            duration: 400,
                            easing: 'easeInOutQuad'
                        });

                        // Scale the button back to original size
                        anime({
                            targets: button,
                            scale: [0.3, 1],
                            duration: 400,
                            easing: 'easeInOutQuad',
                            complete: function () {
                                setTimeout(() => {
                                    button.classList.remove("shrink"); // Remove shrink class
                                    buttonText.style.display = "block";
                                    buttonText.style.opacity = "1";
                                    button.querySelector(".checkIcon")?.remove();
                                }, 4000); // Delay before reversing animation
                            }
                        });
                    }
                });
            }
        });
    }

    // Handle Submit Button Click
    button.addEventListener("click", function () {
        button.disabled = true;

        if (validateInputs()) {
            animateButton(); // Trigger animation
            addComment();

            // Show thank-you message
            thankYouMessage.classList.remove('d-none');

            // Hide thank-you message after 5 seconds
            setTimeout(() => {
                thankYouMessage.classList.add('d-none');
            }, 5000);

            // Re-enable the button after animation
            setTimeout(() => {
                button.disabled = false;
            }, 3000);
        } else {
            button.disabled = false;
        }
    });

    

    // Attach event listeners to validate inputs on change
    document.getElementById("emailInput").addEventListener("input", validateInputs);
    document.getElementById("nameInput").addEventListener("input", validateInputs);
    document.getElementById("commentTextInput").addEventListener("input", validateInputs);

    // Sort comments when the sorting option changes
    sortCommentsSelect.addEventListener("change", function () {
        comments.sort((a, b) => {
            if (sortCommentsSelect.value === "newest") {
                return new Date(b.date) - new Date(a.date);
            } else {
                return new Date(a.date) - new Date(b.date);
            }
        });
        displayedCommentsCount = 0; // Reset displayed comments count for new sorting
        commentsContainer.innerHTML = ''; // Clear comments container
        renderComments();
    });

    // Handle "Show More" Button Click
    showMoreBtn.addEventListener("click", renderComments);

    // Load comments from local storage on page load
    loadComments();

    // Auto-capitalize the beginning of the forms
    function capitalizeFirstLetter(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    document.getElementById("nameInput").addEventListener("input", function () {
        this.value = capitalizeFirstLetter(this.value);
    });

    function capitalizeSentences(str) {
        return str.replace(/(?:^|\.\s+)([a-z])/g, function (match, p1) {
            return match.toUpperCase();
        });
    }

    document.getElementById("commentTextInput").addEventListener("input", function () {
        this.value = capitalizeSentences(this.value);
    });


    // function addCommentProgrammatically(name, commentText, date) {
    //     // Use the provided date or default to the current date if not provided
    //     const commentDate = date ? new Date(date) : new Date();
    //     const formattedDate = commentDate.toISOString(); // Format the date to ISO string
    
    //     // Create a new comment object
    //     const newComment = {
    //         name: name.trim(),
    //         date: formattedDate,
    //         text: commentText.trim()
    //     };
    
    //     // Add the new comment to the array
    //     comments.push(newComment);
    
    //     // Sort comments by date (newest first)
    //     comments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    //     // Update local storage
    //     localStorage.setItem('comments', JSON.stringify(comments));
    
    //     // Update the total comments counter
    //     totalCommentsSpan.textContent = comments.length;
    
    //     // Reset displayed comments count
    //     displayedCommentsCount = 0;
    
    //     // Clear the comments container and re-render comments
    //     commentsContainer.innerHTML = '';
    //     renderComments();
    
    //     // Optionally display a message to indicate success
    //     console.log("Comment added successfully!");
    // }
    
    
    // // Function to load comments from a JSON file
    // function loadCommentsFromJSON(filePath) {
    //     fetch(filePath)
    //         .then(response => {
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok ' + response.statusText);
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             data.forEach(comment => {
    //                 // Add each comment from the JSON file with a specific date
    //                 addCommentProgrammatically(comment.name, comment.text, comment.date);
    //             });
    //             console.log("Comments loaded from JSON successfully.");
    //         })
    //         .catch(error => {
    //             console.error('Error loading comments from JSON:', error);
    //         });
    // }
    
    // // Call the function to load comments from the JSON file
    // loadCommentsFromJSON('comments.json');

});
