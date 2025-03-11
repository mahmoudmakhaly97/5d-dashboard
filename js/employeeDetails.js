// Function to fetch employee details by ID
async function fetchEmployeeDetails(employeeId) {
  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!authToken) {
    alert("No authentication token found. Please log in.");
    return;
  }

  try {
    const response = await fetch(
      `http://attendance-service.5d-dev.com/api/Employee/GetEmployeeWithId?id=${employeeId}`,
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

    const employee = await response.json();
    return employee;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    alert("Failed to fetch employee details. Please try again.");
  }
}

// Function to display employee details
function displayEmployeeDetails(employee) {
  const employeeDetails = document.getElementById("employee-details");
  const overview = document.getElementById("overview");
  employeeDetails.innerHTML = `
        <div style="display: flex; align-items: center; gap: 20px">
         ${
           employee.imagePath
             ? `<img style="width: 40px; height: 40px;border-radius: 50%;overflow:hidden" 
              src="http://attendance-service.5d-dev.com${employee.imageUrl}" />`
             : `<img style="width: 40px; height: 40px;border-radius: 50%;overflow:hidden"
              src="https://placehold.co/30x30" />`
         }
    <div>
          <h3> ${employee.name}</h3>
          ${employee.jobTitle ? ` <p> employee.jobTitle</p>` : ""}
          </div>
   </div>
      `;
  overview.innerHTML = ` <div style="display:flex  ">   <div > 
  <p><strong>Full Name:</strong> ${employee.name}</p>
      <p><strong>Work Email:</strong> ${employee.email}</p>
      <p><strong>Department:</strong> ${employee.department}</p></div>
     <div style="padding-left:250px"> <p><strong>Job Title:</strong> ${
       employee.jobTitle || ""
     }</p>
      <p><strong>managerName:</strong> ${employee.managerName || ""}</p>
      <p><strong>mobile Number:</strong> ${
        employee.mobileNumber || ""
      }</p></div></div>`;
}

// Extract employee ID from URL and fetch details
const urlParams = new URLSearchParams(window.location.search);
const employeeId = urlParams.get("id");

if (employeeId) {
  fetchEmployeeDetails(employeeId)
    .then((employee) => {
      if (employee) {
        displayEmployeeDetails(employee);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
} else {
  alert("No employee ID found in the URL.");
}
