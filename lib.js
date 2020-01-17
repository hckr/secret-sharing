const rangeMax = "1e100";

function randomBigInt() {
    return bigInt.randBetween("0", rangeMax);
}

function createSecretSharingSchemeNN(secret, n) {
    let shares = [], lastShare = secret;
    for (let i = 0; i < n - 1; ++i) {
        let share = randomBigInt();
        lastShare = lastShare.xor(share);
        shares.push(share);
    }
    shares.push(lastShare);
    return shares;
}

function recoverSecretNN(shares) {
    let secret = shares[0];
    for (let i = 1; i < shares.length; ++i) {
        secret = secret.xor(shares[i]);
    }
    return secret;
}

function createSecretSharingSchemeNM(secret, m, n, p) {
    let coeffs = [];
    for (let i = 0; i < m - 1; ++i) {
        coeffs.push(randomBigInt());
    }
    let shadows = [];
    for (let i = 0; i < n; ++i) {
        const x = i + 1;
        let shadow = secret;
        for (let j = 0; j < m - 1; ++j) {
            const power = j + 1;
            shadow = shadow.add(coeffs[j].multiply(Math.pow(x, power)));
        }
        shadows.push(`${x},${shadow.mod(p)}`);
    }
    return shadows;
}

function recoverSecretNM(shadows, p) {
    let secret = bigInt(0);
    const groups = shadows.map(s => bigInt(s.split(',')[0]));
    for (let i = 0; i < shadows.length; ++i) {
        let [currentGroup, shadow] = shadows[i].split(',').map(v => bigInt(v.trim()));
        secret = secret.add(
            groups
                .filter(g => !g.equals(currentGroup))
                .reduce(
                    (acc, group) =>
                        acc.multiply(
                            bigInt.zero.minus(group)
                                .multiply(
                                    currentGroup.minus(group).modInv(p)
                                )
                        ).mod(p),
                    shadow)
        ).mod(p);
    }

    return secret < 0 ? secret.add(p) : secret;
}
