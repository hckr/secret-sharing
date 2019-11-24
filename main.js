const secretInput = document.getElementById('secret-input');
const pInput = document.getElementById('p-input');

pInput.value = findFirstProbablePrimeGreaterThan(bigInt(rangeMax));

document.getElementById('random-secret-button').onclick = function() {
    secretInput.value = randomBigInt();
};

document.getElementById('secret-sharing-form').onsubmit = function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const groupCount = 3;
    
    const groupShares = createSecretSharingSchemeNN(bigInt(formData.get('secret')), groupCount);
    for (let i = 1; i <= groupShares.length; ++i) {
        const groupSecret = groupShares[i-1];
        document.getElementById(`result-secret-${i}`).value = groupSecret;
        
        const shadowsCount = parseInt(formData.get(`shadows-count-${i}`));
        const shadowsNeeded = parseInt(formData.get(`shadows-needed-${i}`));
        const p = bigInt(pInput.value);
        const shadows = createSecretSharingSchemeNM(groupSecret, shadowsNeeded, shadowsCount, p);
        document.getElementById(`result-shadows-${i}`).value = shadows.join('\n');
    }
};

document.getElementById('secret-recovery-form').onsubmit = function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const groupCount = 3;
    const p = bigInt(pInput.value);
    
    const groupSecrets = [];
    
    for (let i = 1; i <= groupCount; ++i) {
        const shadows = formData.get(`shadows-${i}`).trim().split('\n').filter(line => line.trim().length);
        let timeStart = Date.now();
        const groupSecret = recoverSecretNM(shadows, p);
        let timeElapsed = Date.now() - timeStart;
        console.log(`secret recovery for group ${i} took ${timeElapsed}`);
        groupSecrets.push(groupSecret);
        document.getElementById(`result-group-secret-${i}`).value = groupSecret;
    }
    
    const secret = recoverSecretNN(groupSecrets);
    document.getElementById('result-secret').value = secret;
};

function findFirstProbablePrimeGreaterThan(n) {
    while (!n.isProbablePrime()) {
        n = n.next();
    }
    return n;
};
