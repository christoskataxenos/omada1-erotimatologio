async function loadData() {
    try {
        const response = await fetch('/api/votes');
        const votes = await response.json();

        calculateStats(votes);
        renderRawTable(votes);
        renderRanking(votes);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Σφάλμα κατά τη φόρτωση δεδομένων.');
    }
}

function calculateStats(votes) {
    document.getElementById('totalVotes').textContent = votes.length;

    if (votes.length === 0) return;

    const totalConfidence = votes.reduce((sum, v) => sum + (v.confidence || 0), 0);
    const avg = (totalConfidence / votes.length).toFixed(1);
    
    const confEl = document.getElementById('avgConfidence');
    confEl.textContent = avg;
    
    // Χρωματισμός βάσει επιπέδου
    if (avg >= 4) confEl.style.color = 'green';
    else if (avg >= 2.5) confEl.style.color = 'orange';
    else confEl.style.color = 'red';
}

function renderRawTable(votes) {
    const tbody = document.querySelector('#rawTable tbody');
    tbody.innerHTML = '';

    votes.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.name}</strong></td>
            <td>${v.choices.first}</td>
            <td>${v.choices.second}</td>
            <td>${v.choices.third}</td>
            <td style="color: ${v.veto ? '#e74c3c' : '#ccc'}">${v.veto || '-'}</td>
            <td>${v.confidence}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRanking(votes) {
    const scores = {};
    const vetoCounts = {};

    // Αρχικοποίηση scores για όλα τα projects που εμφανίζονται
    votes.forEach(v => {
        const p1 = v.choices.first;
        const p2 = v.choices.second;
        const p3 = v.choices.third;
        
        if (!scores[p1]) scores[p1] = 0;
        if (!scores[p2]) scores[p2] = 0;
        if (!scores[p3]) scores[p3] = 0;

        scores[p1] += 3;
        scores[p2] += 2;
        scores[p3] += 1;

        if (v.veto) {
            if (!vetoCounts[v.veto]) vetoCounts[v.veto] = [];
            vetoCounts[v.veto].push(v.name);
        }
    });

    // Μετατροπή σε πίνακα για ταξινόμηση
    const ranking = Object.keys(scores).map(project => {
        return {
            project,
            points: scores[project],
            vetos: vetoCounts[project] || []
        };
    });

    // Ταξινόμηση κατά πόντους (φθίνουσα)
    ranking.sort((a, b) => b.points - a.points);

    // Εμφάνιση
    const tbody = document.querySelector('#rankingTable tbody');
    tbody.innerHTML = '';

    ranking.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        let rankClass = '';
        if (index === 0) rankClass = 'badge badge-1';
        if (index === 1) rankClass = 'badge badge-2';
        if (index === 2) rankClass = 'badge badge-3';

        // Αν έχει Veto, κοκκινίζουμε τη γραμμή ελαφρώς
        if (item.vetos.length > 0) {
            tr.style.backgroundColor = '#fff5f5';
        }

        tr.innerHTML = `
            <td><span class="${rankClass}">${index + 1}</span></td>
            <td>${item.project}</td>
            <td><strong>${item.points}</strong></td>
            <td>
                ${item.vetos.length > 0 
                    ? `<span class="veto-flag">⚠️ ${item.vetos.length} (από ${item.vetos.join(', ')})</span>` 
                    : '<span style="color:#2ecc71">Ok</span>'}
            </td>
            <td><small>Total Score: ${item.points}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

// Αυτόματη φόρτωση
document.addEventListener('DOMContentLoaded', loadData);
