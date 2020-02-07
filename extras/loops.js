


const findLoops = (graph) => {
    let cycles = []
    function main() {
        for (const edge of graph) {
            for (const node of edge) {
                findNewCycles([node])
            }
        }
        return cycles;
    }
    function findNewCycles(path) {
        const start_node = path[0]
        let next_node = null
        let sub = []
        // visit each edge and each node of each edge
        for (const edge of graph) {
            const [node1, node2] = edge
            if (edge.includes(start_node)) {
                next_node = node1 === start_node ? node2 : node1
            }
            if (notVisited(next_node, path)) {
                // eighbor node not on path yet
                sub = [next_node].concat(path)
                // explore extended path
                findNewCycles(sub)
            } else if (path.length > 2 && next_node === path[path.length - 1]) {
                // cycle found
                const p = rotateToSmallest(path)
                const inv = invert(p)
                if (isNew(p) && isNew(inv)) {
                    cycles.push(p)
                }
            }
        }
    }

    function invert(path) {
        return rotateToSmallest([...path].reverse())
    }
    // rotate cycle path such that it begins with the smallest node
    function rotateToSmallest(path) {
        const n = path.indexOf(Math.min(...path))
        return path.slice(n).concat(path.slice(0, n))
    }
    function isNew(path) {
        const p = JSON.stringify(path)
        for (const cycle of cycles) {
            if (p === JSON.stringify(cycle)) {
                return false
            }
        }
        return true
    }
    function notVisited(node, path) {
        const n = JSON.stringify(node)
        for (const p of path) {
            if (n === JSON.stringify(p)) {
                return false
            }
        }
        return true
    }
    return main();
}

