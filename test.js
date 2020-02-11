
const adj = [
    [1],
    [0, 2, 3],
    [1, 4, 5, 3],
    [1, 6, 7, 2],
    [2],
    [2, 6],
    [5, 3],
    [3]];


const vis = [];
let loop = [];
const dfs = (node, parent) => {
    vis.push(node);
    adj[node].forEach((newNode) => {
        if (!vis.includes(newNode)) {
            loop = [];

            dfs(newNode, node);

        } else {
            if (newNode !== node) {
                console.log('LOOP', newNode);
                loop.push(newNode);
                console.log(loop);
                return;
            }
            console.log(newNode, node);

            return;

        }
    })
};


dfs(0, -1);









