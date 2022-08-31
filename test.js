const [a,b] = `acbnd=123213=;`.split(';')[0].trim().split(/=(.+)/);
console.log(a, b)