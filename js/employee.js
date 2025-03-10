// Constants
const ITEMS_PER_PAGE = 7; // Number of items to display per page
let currentPage = 1; // Track the current page
let allEmployees = []; // Store all employees fetched from the API

// Fetch employees from the API
async function fetchEmployees() {
  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!authToken) {
    alert("No authentication token found. Please log in.");
    return;
  }

  try {
    const response = await fetch(
      "http://attendance-service.5d-dev.com/api/Employee/GetAllEmployees",
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
    console.log(data);

    allEmployees = data; // Store all employees
    return data; // Assuming the API returns an array of employee objects
  } catch (error) {
    console.error("Error fetching employees:", error);
    alert("Failed to fetch employee data. Please try again.");
  }
}

// Fetch employee details (including manager's name) by ID
async function fetchEmployeeDetails(employeeId) {
  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!authToken) {
    alert("No authentication token found. Please log in.");
    return;
  }

  try {
    const response = await fetch(
      `http://attendance-service.5d-dev.com/api/Employee/GetEmployeeWithId/${employeeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch employee details");
    }

    const data = await response.json();
    return data; // Assuming the API returns employee details including manager's name
  } catch (error) {
    console.error("Error fetching employee details:", error);
    return null;
  }
}

// Populate the table with employee data for the current page
// Populate the table with employee data for the current page
// Populate the table with employee data for the current page
async function populateTable(employees) {
  const tbody = document.querySelector("table tbody");
  const loadingDiv = document.getElementById("loading");

  // Show loading spinner
  loadingDiv.style.display = "block";
  tbody.innerHTML = ""; // Clear existing rows

  try {
    // Fetch all employee details in parallel
    const employeeDetailsList = await Promise.all(
      employees.map((employee) => fetchEmployeeDetails(employee.id))
    );

    // Loop through each employee and create table rows
    employees.forEach((employee, index) => {
      const employeeDetails = employeeDetailsList[index];

      // Create a new row
      const row = document.createElement("tr");

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
      managerCell.textContent = employeeDetails?.managerName || "";
      row.appendChild(managerCell);

      // Append row to table
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading employee data:", error);
  } finally {
    // Hide loading spinner
    loadingDiv.style.display = "none";
  }
}

// Generate pagination links
function generatePagination(totalPages) {
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
function changePage(newPage) {
  const totalPages = Math.ceil(allEmployees.length / ITEMS_PER_PAGE);

  if (newPage < 1 || newPage > totalPages) {
    return; // Do nothing if the page is out of range
  }

  currentPage = newPage; // Update the current page
  generatePagination(totalPages); // Regenerate pagination links

  // Update the table with data for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const employeesForPage = allEmployees.slice(startIndex, endIndex);

  populateTable(employeesForPage);
}

// On page load, fetch employees and initialize pagination
document.addEventListener("DOMContentLoaded", async function () {
  const employees = await fetchEmployees();

  if (employees) {
    const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
    generatePagination(totalPages); // Generate pagination links
    changePage(1); // Load the first page
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