// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    getFirestore,
    collection, 
    addDoc, 
    query, 
    // where, 
    getDocs, 
    // updateDoc, 
    // deleteDoc, 
    //  doc,
    limit,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBSxIZ3Ot_jZ2BqIOKTFY4uZnw2iNdckAQ",
    authDomain: "practice-project-528a5.firebaseapp.com",
    projectId: "practice-project-528a5",
    storageBucket: "practice-project-528a5.firebasestorage.app",
    messagingSenderId: "962288126148",
    appId: "1:962288126148:web:67676ce734011a2a86a191",
    measurementId: "G-HQVQREHNJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById("auth-section");
const registerSection = document.getElementById("register-section");
const appSection = document.getElementById("app-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login");
const registerBtn = document.getElementById("register");
const logoutBtn = document.getElementById("logout");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const gotoSignIn = document.getElementById("click-signIn");
const gotoRegister = document.getElementById("click-register");
const googleSigninButton = document.getElementById("google-signin-btn");
const googleSigninButton2 = document.getElementById("google-signin-btn2");


// Persistence
setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("Persistence set to local"))
    .catch((error) => console.error("Error setting persistence:", error));

// Toggle between Register and Login
gotoSignIn.addEventListener("click", () => {
    registerSection.style.display = "none";
    authSection.style.display = "block";
});
gotoRegister.addEventListener("click", () => {

    authSection.style.display = "none";
    registerSection.style.display = "block";
});

// Register
registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = registerEmail.value;
    const password = registerPassword.value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        Swal.fire({
            title: "You've successfully Registered",
            icon: "success",
        })
        registerSection.style.display = "none";
        appSection.style.display = "block";
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
});

// Login
loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        Swal.fire({
            title: "Login Successful",
            icon: "success",
        })
        authSection.style.display = "none";
        appSection.style.display = "block";
    } catch (error) {
        if (error.code === "auth/too-many-requests") {
            Swal.fire({
                icon: "error",
                title: "Account Locked",
                text: "Too many login attempts. Please try again later.",
            });
        }
        else if (error.code === 'auth/network-request-failed') {
            Swal.fire({
                icon: "error",
                title: "Network error",
                text: "Please connect to a stable Internet Connection before Proceeding!",
            });
        }
        else {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message,
            });
        }
    };
})

// Logout
logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
await Swal.fire({
        title: "Logout Successful",
        icon: "success",
    })
    // authSection.style.display = "block";
    // appSection.style.display = "none";
    window.location = "./index.html"
});

// Google Sign-In
const handleGoogleSignIn = async (button) => {
    button.addEventListener("click", async (e) => {
        e.preventDefault();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Google user signed in:", result.user);
            Swal.fire({
                title: "Login Successful",
                icon: "success",
            }).then(() => {
                authSection.style.display = "none";
                registerSection.style.display = "none";
                appSection.style.display = "block";
            });
        } catch (error) {
            console.error("Error during Google sign-in:", error);
            Swal.fire({
                icon: "error",
                title: "Google Sign-In Failed",
                text: error.message,
            });
        }
    });
};
handleGoogleSignIn(googleSigninButton);
handleGoogleSignIn(googleSigninButton2);



// Monitor Auth State
window.onload = () => {
    onAuthStateChanged(auth, (user) => {

        document.getElementById('loading').style.display = 'none';
        if (user) {
            authSection.style.display = "none";
            appSection.style.display = "block";
            loadPosts()

        } else {
            authSection.style.display = "block";
            appSection.style.display = "none";
        }
    })
};
document.getElementById('post').addEventListener('click', (e) => {
    e.preventDefault();


    appSection.style.display = 'none'; // Make sure 'appSection' is correctly defined
    document.getElementById('post-form').style.display = 'block'; // Make sure the element with id 'post-form' exists
});




document.getElementById('add-post').addEventListener('click', async (e) => {
    e.preventDefault();

    // Get the form field values
    const title = document.getElementById('post-title').value;
    const time = document.getElementById('reading-time').value;
    const postDes = document.getElementById('description').value;
    const writer = document.getElementById('writer-name').value;

    // Check if any of the fields are empty
    if (!time || !postDes || !writer || !title) {
        Swal.fire({
            icon: "error",
            title: "One of the fields is/are empty",
        });
    } else {
        // Create postData object
        const postData = {
            title: title,
            writer: writer,
            description: postDes,
            readingTime: time,
            timestamp: new Date().toISOString(),  // Add timestamp for the post
        };

        // Call addData to save post data
        try {
            // Add the data to Firebase
            const docRef = await addData(postData);

            // Show success alert
            Swal.fire({
                icon: "success",
                title: "Post Added Successfully!",
            });

            // Clear form fields after success
            document.getElementById('post-title').value = '';
            document.getElementById('writer-name').value = '';
            document.getElementById('description').value = '';
            document.getElementById('reading-time').value = '';

            // Optionally, hide the form after posting
            document.getElementById('post-form').style.display = 'none';

            // Fetch the new post from Firebase
            const newPost = {
                title: title,
                writer: writer,
                description: postDes,
                readingTime: time,
                timestamp: new Date().toISOString(),  // Using the current timestamp
            };

            // Update the recent blogs section with the new post
            const recentBlogsSection = document.querySelector('.recent-blogs');
            
            // Create the new post element
            const newPostElement = document.createElement('article');
            newPostElement.classList.add('blog');
            newPostElement.innerHTML = `
                <h3>${newPost.title}</h3>
                <p class="meta">By ${newPost.writer} • ${newPost.readingTime} min read</p>
                <p>${newPost.description}</p>
            `;

            // Insert the new post at the top of the list
            recentBlogsSection.insertBefore(newPostElement, recentBlogsSection.firstChild);

            // Remove the first post if there are more than 2 posts
            if (recentBlogsSection.children.length > 2) {
                recentBlogsSection.removeChild(recentBlogsSection.lastChild);
            }

            // Show the app-section and hide the post-form
            document.getElementById('app-section').style.display = 'block';

            // Add click event to open the post in a new page
            newPostElement.addEventListener('click', () => {
                window.location.href = 'blog-page.html'; // Redirect to a new page (you can replace with the actual blog page URL)
            });

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to Add Post",
                text: error.message,
            });
        }
    }
});

// Function to add data to Firebase
// Function to add data to Firebase
async function addData(postData) {
    try {
        const docRef = await addDoc(collection(db, "posts"), postData);
        console.log("Document written with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        throw new Error("Error adding post: " + error.message);
    }
}

// Function to load posts from Firebase







async function loadPosts() {
    try {
        // Query Firestore and order posts by timestamp (descending)
        const querySnapshot = await getDocs(query(
            collection(db, "posts"), 
            orderBy("timestamp", "desc"), // Order posts by timestamp in descending order
            limit(2) // Limit to 2 posts
        ));
        
        console.log(querySnapshot.docs);  // Check the docs array

        const postsContainer = document.querySelector('.recent-blogs');
        postsContainer.innerHTML = ''; // Clear existing posts

        querySnapshot.docs.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('article');
            postElement.classList.add('blog');
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                <p class="meta">By ${post.writer} • ${post.readingTime} min read</p>
            `;
            postElement.addEventListener('click', () => {
                window.location.href = `blog-page.html?postId=${doc.id}`; // Pass the post ID to the detail page
            });

            postsContainer.prepend(postElement); // Add post to the top
        });
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}





// Make sure to call loadPosts when the page loads
