document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = `Participants (${details.participants.length})`;
        participantsDiv.appendChild(participantsHeading);

        if (details.participants.length > 0) {
          const container = document.createElement("div");
          container.style.listStyle = "none";
          details.participants.forEach((p) => {
            const row = document.createElement("div");
            row.className = "participant-row";
            const nameSpan = document.createElement("span");
            nameSpan.textContent = p;
            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.innerHTML = "&#128465;"; // Trash can icon
            deleteIcon.title = "Unregister";
            deleteIcon.style.cursor = "pointer";
            deleteIcon.onclick = async function() {
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, { method: "POST" });
                if (!response.ok) {
                  throw new Error("Failed to unregister");
                }
                const result = await response.json();
                messageDiv.textContent = result.message || "Unregistered successfully.";
                messageDiv.className = "success";
                messageDiv.classList.remove("hidden");
                setTimeout(() => { messageDiv.classList.add("hidden"); }, 3000);
                fetchActivities();
              } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => { messageDiv.classList.add("hidden"); }, 3000);
              }
            };
            row.appendChild(nameSpan);
            row.appendChild(deleteIcon);
            container.appendChild(row);
          });
          participantsDiv.appendChild(container);
        } else {
          const p = document.createElement("p");
          p.className = "no-participants";
          p.textContent = "No participants yet";
          participantsDiv.appendChild(p);
        }

        activityCard.appendChild(participantsDiv);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
