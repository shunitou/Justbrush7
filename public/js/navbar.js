// public/js/navbar.js
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('/user');
    const data = await response.json();
    const usernameElement = document.getElementById('username');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink'); // Added this line

    if (response.ok) {
      if (data.username) {
        // User is logged in
        usernameElement.textContent = `Welcome, ${data.username}`;
        loginLink.style.display = 'none'; // Hide the login link
        logoutLink.style.display = 'inline-block'; // Show the logout link
      } else {
        // User is not logged in
        usernameElement.textContent = 'Welcome, Guest';
        loginLink.style.display = 'inline-block'; // Show the login link
        logoutLink.style.display = 'none'; // Hide the logout link
      }
    } else {
      console.error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
});
