const form = document.getElementById("employeeForm");
const employeesList = document.getElementById("employeesList");

const API_URL = "http://localhost:3000/api/employees";

// Charger et afficher les employés
async function loadEmployees() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des employés");
        }

        const employees = await response.json();
        employeesList.innerHTML = "";

        employees.forEach((employee) => {
            const div = document.createElement("div");
            div.classList.add("employee");

            const name = document.createElement("strong");
            name.textContent = employee.name;

            const email = document.createElement("p");
            email.textContent = `Email : ${employee.email}`;

            const department = document.createElement("p");
            department.textContent =
                `Département : ${employee.department || ""}`;

            const position = document.createElement("p");
            position.textContent =
                `Poste : ${employee.position || ""}`;

            // Bouton Modifier
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Modifier";
            editButton.style.backgroundColor = "#2563eb";

            editButton.addEventListener("click", async () => {
                const newName = prompt("Nom complet :", employee.name);
                if (newName === null) return;

                const newEmail = prompt("Email :", employee.email);
                if (newEmail === null) return;

                const newDepartment = prompt(
                    "Département :",
                    employee.department || ""
                );
                if (newDepartment === null) return;

                const newPosition = prompt(
                    "Poste :",
                    employee.position || ""
                );
                if (newPosition === null) return;

                if (!newName.trim() || !newEmail.trim()) {
                    alert("Le nom et l'email sont obligatoires.");
                    return;
                }

                try {
                    const response = await fetch(
                        `${API_URL}/${employee.id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                name: newName.trim(),
                                email: newEmail.trim(),
                                department: newDepartment.trim(),
                                position: newPosition.trim()
                            })
                        }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            result.error || "Erreur lors de la modification"
                        );
                    }

                    await loadEmployees();
                    alert("Employé modifié avec succès !");

                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            });

            // Bouton Supprimer
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Supprimer";
            deleteButton.style.backgroundColor = "#dc2626";
            deleteButton.style.marginLeft = "8px";

            deleteButton.addEventListener("click", async () => {
                const confirmed = confirm(
                    `Voulez-vous vraiment supprimer ${employee.name} ?`
                );

                if (!confirmed) return;

                try {
                    const response = await fetch(
                        `${API_URL}/${employee.id}`,
                        { method: "DELETE" }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            result.error || "Erreur lors de la suppression"
                        );
                    }

                    await loadEmployees();
                    alert("Employé supprimé avec succès !");

                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            });

            div.append(
                name,
                email,
                department,
                position,
                editButton,
                deleteButton
            );

            employeesList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        employeesList.textContent =
            "Impossible de charger les employés.";
    }
}

// Ajouter un employé
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const employee = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        position: document.getElementById("position").value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de l'ajout");
        }

        form.reset();
        await loadEmployees();
        alert("Employé ajouté avec succès !");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

// Charger la liste au démarrage
loadEmployees();