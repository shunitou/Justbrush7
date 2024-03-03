document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Fetch user points from the server
    const response = await fetch('/points');
    const data = await response.json();

    // Update the HTML content based on the response
    const userPointsElement = document.getElementById('userPoints');

    if (response.ok) {
      userPointsElement.textContent = `Your total points: ${data.userPoints}`;
    } else {
      const errorMessage = data.error || 'Failed to fetch points';
      userPointsElement.textContent = errorMessage;
    }
  } catch (error) {
    console.error('Error fetching points:', error);
  }
});