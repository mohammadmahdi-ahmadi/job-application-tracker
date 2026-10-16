"use strict";

// ------------------------------
// Variables
// ------------------------------

let applications = [];
let dataLoaded = false;

const statuses = ["Saved", "Applied", "Interview", "Closed"];

// ------------------------------
// Get HTML elements
// ------------------------------

const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");

const retryButton = document.getElementById("retry-button");

const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const interviewCount = document.getElementById("interview-count");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const activeFilter = document.getElementById("active-filter");
const clearFiltersButton = document.getElementById("clear-filters");

const applicationList = document.getElementById("application-list");
const emptyState = document.getElementById("empty-state");

const addForm = document.getElementById("add-form");
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const noteInput = document.getElementById("note");

const addButton = document.getElementById("add-button");

// ------------------------------
// Load data from data.json
// ------------------------------

async function loadApplications() {
  
loadingMessage.hidden = false;
errorMessage.hidden = true;

disableControls();

try {

    const response = await fetch("data.json");

    if (!response.ok) {
        throw new Error("Failed to load data.json");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
    }

    applications = data;
    dataLoaded = true;

    loadingMessage.hidden = true;

    enableControls();

    renderAll();

} catch (error) {
    console.error(error);

    loadingMessage.hidden = true;
    errorMessage.hidden = false;

    dataLoaded = false;
}
;
}

// ------------------------------
// Enable and disable controls
// ------------------------------

function disableControls() {
addButton.disabled = true;
searchInput.disabled = true;
statusFilter.disabled = true;
activeFilter.disabled = true;
clearFiltersButton.disabled = true;
;
}

function enableControls() {
addButton.disabled = false;
searchInput.disabled = false;
statusFilter.disabled = false;
activeFilter.disabled = false;
clearFiltersButton.disabled = false;
;
}

// ------------------------------
// Render everything
// ------------------------------

function renderAll() {
renderSummary();
renderApplications();
;
}

// ------------------------------
// Calculate summary
// ------------------------------

function renderSummary() {

const total = applications.length;

const active = applications.filter(function(application) {
    return application.status !== "Closed";
}).length;

const interviews = applications.filter(function(application) {
    return application.status === "Interview";
}).length;

totalCount.textContent = total;
activeCount.textContent = active;
interviewCount.textContent = interviews;
;
}

// ------------------------------
// Search and filter
// ------------------------------

function getVisibleApplications() {

const searchText = searchInput.value.trim().toLowerCase();
const selectedStatus = statusFilter.value;
const activeOnly = activeFilter.checked;

const visibleApplications = applications.filter(function(application) {

    const company = application.company.trim().toLowerCase();
    const role = application.role.trim().toLowerCase();

    const matchesSearch =
        searchText === "" ||
        company.includes(searchText) ||
        role.includes(searchText);

    const matchesStatus =
        selectedStatus === "all" ||
        application.status === selectedStatus;

    const matchesActive =
        !activeOnly ||
        application.status !== "Closed";

    return matchesSearch && matchesStatus && matchesActive;
});

return visibleApplications;
;
}

// ------------------------------
// Render application cards
// ------------------------------

function renderApplications() {

const visibleApplications = getVisibleApplications();

applicationList.innerHTML = "";

if (visibleApplications.length === 0) {

    emptyState.hidden = false;
    return;
}

emptyState.hidden = true;

visibleApplications.forEach(function(application) {

    const card = createApplicationCard(application);

    applicationList.appendChild(card);
});
;
}

// ------------------------------
// Create one application card
// ------------------------------

function createApplicationCard(application) {
  
const card = document.createElement("article");
card.className = "card";

// Role
const title = document.createElement("h3");
title.className = "item-title";
title.textContent = application.role;

// Company
const company = document.createElement("p");
company.textContent = application.company;

// Status label
const statusLabel = document.createElement("label");
statusLabel.textContent = "Status";
statusLabel.setAttribute(
    "for",
    "status-" + application.id
);

// Status select
const statusSelect = document.createElement("select");
statusSelect.id = "status-" + application.id;
statusSelect.className = "status-select";
statusSelect.dataset.id = application.id;

statuses.forEach(function(status) {

    const option = document.createElement("option");

    option.value = status;
    option.textContent = status;

    if (status === application.status) {
        option.selected = true;
    }

    statusSelect.appendChild(option);
});


// Note label
const noteLabel = document.createElement("label");
noteLabel.textContent = "Follow-up note";
noteLabel.setAttribute(
    "for",
    "note-" + application.id
);


// Note textarea
const noteTextarea = document.createElement("textarea");

noteTextarea.id = "note-" + application.id;
noteTextarea.className = "note-input";
noteTextarea.maxLength = 160;
noteTextarea.value = application.note || "";
noteTextarea.dataset.id = application.id;


// Buttons
const actions = document.createElement("div");
actions.className = "actions";


const saveButton = document.createElement("button");

saveButton.type = "button";
saveButton.className = "save-note";
saveButton.dataset.id = application.id;
saveButton.textContent = "Save note";


const deleteButton = document.createElement("button");

deleteButton.type = "button";
deleteButton.className = "btn-danger delete-application";
deleteButton.dataset.id = application.id;
deleteButton.textContent = "Delete";


actions.appendChild(saveButton);
actions.appendChild(deleteButton);


// Put elements inside card
card.appendChild(title);
card.appendChild(company);
card.appendChild(statusLabel);
card.appendChild(statusSelect);
card.appendChild(noteLabel);
card.appendChild(noteTextarea);
card.appendChild(actions);

return card;
;
}

// ------------------------------
// Validation
// ------------------------------

function validateCompany(company) {
  
const value = company.trim();

if (value.length < 2 || value.length > 80) {

    return "Company must be between 2 and 80 characters.";
}

return "";
;
}

function validateRole(role) {
 
const value = role.trim();

if (value.length < 2 || value.length > 80) {

    return "Role must be between 2 and 80 characters.";
}

return "";
;
}

function validateNote(note) {
  
const value = note.trim();

if (value.length > 160) {

    return "Note must be 160 characters or fewer.";
}

return "";
;
}

// ------------------------------
// Add new application
// ------------------------------

function addApplication(event) {
  
event.preventDefault();

if (!dataLoaded) {
    return;
}


const company = companyInput.value.trim();
const role = roleInput.value.trim();
const note = noteInput.value.trim();


const companyError = validateCompany(company);

if (companyError) {

    alert(companyError);
    companyInput.focus();

    return;
}


const roleError = validateRole(role);

if (roleError) {

    alert(roleError);
    roleInput.focus();

    return;
}


const noteError = validateNote(note);

if (noteError) {

    alert(noteError);
    noteInput.focus();

    return;
}


const newApplication = {

    id: createNewId(),

    company: company,

    role: role,

    status: "Saved",

    note: note
};


applications.push(newApplication);

renderAll();

addForm.reset();

showSuccess("Opportunity added successfully.");
;
}

// ------------------------------
// Create new ID
// ------------------------------

function createNewId() {
  
if (applications.length === 0) {
    return 1;
}

const ids = applications.map(function(application) {
    return Number(application.id);
});

return Math.max(...ids) + 1;
;
}

// ------------------------------
// Change application status
// ------------------------------

function updateStatus(id, newStatus) {
  
const application = applications.find(function(application) {

    return String(application.id) === String(id);
});


if (!application) {
    return;
}


if (!statuses.includes(newStatus)) {
    return;
}


application.status = newStatus;

renderAll();

showSuccess("Status updated successfully.");
;
}

// ------------------------------
// Save note
// ------------------------------

function saveNote(id, note) {
  
const value = note.trim();

const noteError = validateNote(value);

if (noteError) {

    alert(noteError);

    return;
}


const application = applications.find(function(application) {

    return String(application.id) === String(id);
});


if (!application) {
    return;
}


application.note = value;

renderAll();

showSuccess("Follow-up note updated successfully.");
;
}

// ------------------------------
// Delete application
// ------------------------------

function deleteApplication(id) {
 
const index = applications.findIndex(function(application) {

    return String(application.id) === String(id);
});


if (index === -1) {
    return;
}


applications.splice(index, 1);

renderAll();

showSuccess("Opportunity deleted successfully.");
;
}

// ------------------------------
// Success message
// ------------------------------

function showSuccess(message) {
  
successMessage.textContent = message;
successMessage.hidden = false;

setTimeout(function() {

    successMessage.hidden = true;

}, 2500);
;
}

// ------------------------------
// Clear filters
// ------------------------------

function clearFilters() {
  
searchInput.value = "";

statusFilter.value = "all";

activeFilter.checked = false;

renderApplications();
;
}

// ------------------------------
// Events
// ------------------------------

addForm.addEventListener("submit", addApplication);

searchInput.addEventListener("input", renderApplications);

statusFilter.addEventListener("change", renderApplications);

activeFilter.addEventListener("change", renderApplications);

clearFiltersButton.addEventListener("click", clearFilters);

// Status change
applicationList.addEventListener("change", function (event) {
  
if (event.target.classList.contains("status-select")) {

    const id = event.target.dataset.id;

    const newStatus = event.target.value;

    updateStatus(id, newStatus);
}
;
});

// Delete and Save Note
applicationList.addEventListener("click", function (event) {
  
if (event.target.classList.contains("delete-application")) {

    const id = event.target.dataset.id;

    deleteApplication(id);
}


if (event.target.classList.contains("save-note")) {

    const id = event.target.dataset.id;

    const noteElement =
        document.getElementById("note-" + id);

    if (noteElement) {

        saveNote(id, noteElement.value);
    }
}
;
});

// Retry
retryButton.addEventListener("click", function () {
  
if (!dataLoaded) {

    loadApplications();
}
;
});

// ------------------------------
// Start the application
// ------------------------------

loadApplications();
