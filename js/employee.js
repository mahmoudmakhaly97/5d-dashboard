// Constants
const ITEMS_PER_PAGE = 10; // Number of items to display per page
let currentPage = 1; // Track the current page
let totalPages = 1; // Track the total number of pages

// Fetch employees for a specific page
async function fetchEmployees(pageNumber, pageSize) {
  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!authToken) {
    alert("No authentication token found. Please log in.");
    return;
  }

  try {
    const response = await fetch(
      `http://attendance-service.5d-dev.com/api/Employee/GetAllEmployees?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch employee data");
    }

    const data = await response.json();
    console.log("Pagination Data:", data);

    // Update totalPages for pagination controls
    totalPages = data.totalPages;

    return data; // Return the entire response object
  } catch (error) {
    console.error("Error fetching employees:", error);
    alert("Failed to fetch employee data. Please try again.");
  }
}

// Populate the table with employee data for the current page
async function populateTable(employees) {
  const tbody = document.querySelector("table tbody");
  const loadingDiv = document.getElementById("loading");

  // Show loading spinner
  loadingDiv.style.display = "block";
  tbody.innerHTML = ""; // Clear existing rows

  try {
    // Loop through each employee and create table rows
    employees.forEach((employee) => {
      // Create a new row
      const row = document.createElement("tr");

      // Add employee ID as a data attribute
      row.setAttribute("data-employee-id", employee.id);

      // Employee ID and Image
      const employeeIdCell = document.createElement("td");
      employeeIdCell.className = "text-left";
      employeeIdCell.innerHTML = `<div style="display: flex; align-items: center; gap: 20px">
      <div>
        ${
          employee.imagePath
            ? `<img style="width: 40px; height: 40px;border-radius: 50%;overflow:hidden" 
              src="http://attendance-service.5d-dev.com${employee.imagePath}" />`
            : `<img style="width: 40px; height: 40px;border-radius: 50%;overflow:hidden"
              src="https://placehold.co/30x30" />`
        }
      </div>
      <div>
        <a class="font-" style="white-space: nowrap;margin-bottom:5px;display:block" href="#">
          <strong>${employee.name}</strong>
        </a>
        <div>${employee.jobTitle || "job title"}</div>
      </div>
    </div>`;
      row.appendChild(employeeIdCell);

      // Email
      const emailCell = document.createElement("td");
      emailCell.className = "hidden-xs text-center";
      emailCell.textContent = employee.email;
      row.appendChild(emailCell);

      // Department
      const departmentCell = document.createElement("td");
      departmentCell.textContent = employee.department;
      row.appendChild(departmentCell);

      // Manager
      const managerCell = document.createElement("td");
      managerCell.className = "visible-lg";
      managerCell.textContent = employee.managerName || ""; // Use managerName directly from the employee object
      row.appendChild(managerCell);

      // Append row to table
      tbody.appendChild(row);
    });

    // Add click event listeners to rows
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
      row.addEventListener("click", () => {
        const employeeId = row.getAttribute("data-employee-id");
        if (employeeId) {
          // Redirect to employee details page with employee ID as a query parameter
          window.location.href = `editEmployeeDetails.html?id=${employeeId}`;
        }
      });
    });
  } catch (error) {
    console.error("Error populating table:", error);
  } finally {
    // Hide loading spinner
    loadingDiv.style.display = "none";
  }
}
// Generate pagination links
function generatePagination() {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = ""; // Clear existing pagination links

  // Add "Previous" button
  const prevLi = document.createElement("li");
  prevLi.innerHTML = `<a href="javascript:void(0)"><i class="fa fa-angle-left"></i></a>`;
  prevLi.addEventListener("click", () => changePage(currentPage - 1));
  paginationContainer.appendChild(prevLi);

  // Always show the first page
  addPageLink(1, paginationContainer);

  // Add dots if currentPage is greater than 3
  if (currentPage > 3) {
    const dotsLi = document.createElement("li");
    dotsLi.innerHTML = `<a href="javascript:void(0)">...</a>`;
    dotsLi.classList.add("disabled");
    paginationContainer.appendChild(dotsLi);
  }

  // Calculate the range of pages to display
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  // Adjust the range if near the start or end
  if (currentPage <= 3) {
    endPage = Math.min(4, totalPages - 1);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(totalPages - 3, 2);
  }

  // Add page numbers within the range
  for (let i = startPage; i <= endPage; i++) {
    addPageLink(i, paginationContainer);
  }

  // Add dots if currentPage is less than totalPages - 2
  if (currentPage < totalPages - 2) {
    const dotsLi = document.createElement("li");
    dotsLi.innerHTML = `<a href="javascript:void(0)">...</a>`;
    dotsLi.classList.add("disabled");
    paginationContainer.appendChild(dotsLi);
  }

  // Always show the last page if totalPages > 1
  if (totalPages > 1) {
    addPageLink(totalPages, paginationContainer);
  }

  // Add "Next" button
  const nextLi = document.createElement("li");
  nextLi.innerHTML = `<a href="javascript:void(0)"><i class="fa fa-angle-right"></i></a>`;
  nextLi.addEventListener("click", () => changePage(currentPage + 1));
  paginationContainer.appendChild(nextLi);

  // Disable "Previous" button on the first page
  if (currentPage === 1) {
    prevLi.classList.add("disabled");
  }

  // Disable "Next" button on the last page
  if (currentPage === totalPages) {
    nextLi.classList.add("disabled");
  }
}

// Helper function to add a page link
function addPageLink(pageNumber, container) {
  const li = document.createElement("li");
  li.innerHTML = `<a href="javascript:void(0)">${pageNumber}</a>`;

  // Highlight the current page
  if (pageNumber === currentPage) {
    li.classList.add("active");
  }

  // Add click event to change page
  li.addEventListener("click", () => changePage(pageNumber));
  container.appendChild(li);
}

// Handle page change
async function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages) {
    return; // Do nothing if the page is out of range
  }

  currentPage = newPage; // Update the current page

  // Fetch data for the new page
  const data = await fetchEmployees(currentPage, ITEMS_PER_PAGE);
  if (data) {
    populateTable(data.employees); // Populate the table with the new data
    generatePagination(); // Regenerate pagination links
  }
}

// On page load, fetch employees for the first page and initialize pagination
document.addEventListener("DOMContentLoaded", async function () {
  const data = await fetchEmployees(currentPage, ITEMS_PER_PAGE);

  if (data) {
    populateTable(data.employees); // Populate the table with the first page of data
    generatePagination(); // Generate pagination links
  }
});

// --------------------------- Handle logout button --------------------------
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      // Remove tokens from both localStorage and sessionStorage
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");

      // Redirect to the sign-in page
      window.location.href = "/sign-in.html"; // Update this to your sign-in page URL
    });
  }
});
// .................................Add employee logic .................................

document
  .getElementById("add-employee-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      department: document.getElementById("department").value,
      managerId: document.getElementById("manager").value,
      mobileNumber: "string", // Add a default value or collect from the form
      jobTitle: "string", // Add a default value or collect from the form
      isNormal: true, // Add a default value or collect from the form
      isManager: true, // Add a default value or collect from the form
      isPassedProbation: true, // Add a default value or collect from the form
    };

    // Send a POST request to the AddEmployee endpoint
    fetch("http://attendance-service.5d-dev.com/api/Employee/AddEmployee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify the content type as JSON
      },
      body: JSON.stringify(formData), // Convert the form data to JSON
    })
      .then((response) => {
        if (!response.ok) {
          // If the response is not OK, try to parse it as text
          return response.text().then((text) => {
            throw new Error(text); // Throw the plain text error
          });
        }
        return response.json(); // Parse the response as JSON if it's OK
      })
      .then((data) => {
        if (data) {
          alert("Employee added successfully!");

          // Reset the form
          document.getElementById("add-employee-form").reset();
          window.location.href = "employee.html";
        }
      })

      .catch((error) => {
        // Display the error message from the server
        alert("Error: " + error.message);
      });
  });
// Function to populate departments dropdown
function populateDepartments() {
  fetch("http://attendance-service.5d-dev.com/api/Employee/GetDepartments")
    .then((response) => response.json())
    .then((data) => {
      const departmentSelect = document.getElementById("department");
      departmentSelect.innerHTML = ""; // Clear existing options

      data.forEach((department) => {
        const option = document.createElement("option");
        option.value = department.name; // Assuming the API returns an 'id' field
        option.textContent = department.name; // Assuming the API returns a 'name' field
        departmentSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching departments:", error));
}

// Function to populate managers dropdown
function populateManagers() {
  fetch("http://attendance-service.5d-dev.com/api/Employee/GetAllManagers")
    .then((response) => response.json())
    .then((data) => {
      const managerSelect = document.getElementById("manager");
      managerSelect.innerHTML = ""; // Clear existing options

      data.forEach((manager) => {
        const option = document.createElement("option");
        option.value = manager.id; // Assuming the API returns an 'id' field
        option.textContent = manager.name; // Assuming the API returns a 'name' field
        managerSelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching managers:", error));
}

// Populate dropdowns when the page loads
document.addEventListener("DOMContentLoaded", () => {
  populateDepartments();
  populateManagers();
});
