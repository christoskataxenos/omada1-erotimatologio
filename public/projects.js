const projects = [
    "Project06 (Διαχείριση Οικονομικών)",
    "Project07 (Διαχείριση Ραντεβού)",
    "Project17 (dbEAP)",
    "Project21 (Διόδια)",
    "Project25 (Εκατομμυριούχος)",
    "Project31 (Δανειστική Βιβλιοθήκη)",
    "Project35 (myBooks)",
    "Project49 (Κατάταξη Υποψηφίων)",
    "Project50 (Συνταγές Μαγειρικής)",
    "Project53 (Διαχείριση Χρόνου)"
];

function populateSelects() {
    const selects = document.querySelectorAll('.project-select');
    
    selects.forEach(select => {
        projects.forEach(proj => {
            const option = document.createElement('option');
            option.value = proj;
            option.textContent = proj;
            select.appendChild(option);
        });
    });
}

// Εκτέλεση κατά τη φόρτωση
document.addEventListener('DOMContentLoaded', populateSelects);
