// ✅ Signup
document.getElementById("signupForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password || !role) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        alert(data.message);

        if (data.success) window.location.href = data.redirectUrl;
    } catch (error) {
        console.error("Signup Error:", error);
        alert("An error occurred. Please try again.");
    }
});

// ✅ Login
document.getElementById("loginForm")?.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.message);

        if (data.success) window.location.href = data.redirectUrl;
    } catch (error) {
        console.error('Login Error:', error);
        alert("An error occurred. Please try again.");
    }
});

// ✅ Logout Function
function logout() {
    fetch('/logout')
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Logout Error:', error);
            alert('An error occurred while logging out.');
        });
}

// ✅ Register for Competition
function registerCompetition() {
    const competitionName = document.getElementById('competitionName')?.value;

    if (!competitionName) {
        alert('Competition name is required!');
        return;
    }

    fetch('/register-competition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionName })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
        console.error('Competition Registration Error:', error);
        alert('An error occurred while registering.');
    });
}

// ✅ Report Injury
function reportInjury() {
    const injuryType = document.getElementById('injuryType')?.value;
    const injuryDate = document.getElementById('injuryDate')?.value;
    const injuryDescription = document.getElementById('injuryDescription')?.value;

    if (!injuryType || !injuryDate || !injuryDescription) {
        alert('All fields are required!');
        return;
    }

    fetch('/report-injury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ injuryType, injuryDate, injuryDescription })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
        console.error('Injury Report Error:', error);
        alert('An error occurred while reporting injury.');
    });
}

// ✅ Save Financial Plan
function saveFinancialPlan() {
    const income = document.getElementById('income')?.value;
    const expenses = document.getElementById('expenses')?.value;
    const savingsGoal = document.getElementById('savingsGoal')?.value;

    if (!income || !expenses || !savingsGoal) {
        alert('All fields are required!');
        return;
    }

    fetch('/save-financial-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, expenses, savingsGoal })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => {
        console.error('Financial Plan Error:', error);
        alert('An error occurred while saving the financial plan.');
    });
}
