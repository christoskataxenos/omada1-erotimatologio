document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const choice1 = document.getElementById('choice1').value;
    const choice2 = document.getElementById('choice2').value;
    const choice3 = document.getElementById('choice3').value;
    const veto = document.getElementById('veto').value;

    // Validation: Check for duplicates in preferences
    if (choice1 === choice2 || choice1 === choice3 || choice2 === choice3) {
        alert('Παρακαλώ επιλέξτε 3 ΔΙΑΦΟΡΕΤΙΚΑ έργα στις προτιμήσεις σας.');
        return;
    }

    // Validation: Check if Veto conflicts with choices (logical paradox)
    if (veto && (veto === choice1 || veto === choice2 || veto === choice3)) {
        alert('Δεν γίνεται να ψηφίζετε ένα έργο και ταυτόχρονα να του βάζετε Veto!');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    // Get selected radio button value
    const confidenceEl = document.querySelector('input[name="confidence"]:checked');
    const confidence = confidenceEl ? confidenceEl.value : null;

    const formData = {
        name: document.getElementById('name').value,
        choices: {
            first: choice1,
            second: choice2,
            third: choice3
        },
        veto: veto || null,
        confidence: parseInt(confidence),
        comments: document.getElementById('comments').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Υποβολή...';
    messageDiv.className = 'hidden';

    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            messageDiv.innerHTML = `
                <strong>Επιτυχία!</strong><br>
                Η ψήφος σας καταχωρήθηκε.<br>
                Ευχαριστούμε για τη συμμετοχή.
            `;
            messageDiv.className = 'success';
            document.getElementById('projectForm').reset();
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            messageDiv.textContent = result.error || 'Υπήρξε ένα πρόβλημα.';
            messageDiv.className = 'error';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.textContent = 'Σφάλμα σύνδεσης.';
        messageDiv.className = 'error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Καταχώρηση Ψήφου';
    }
});