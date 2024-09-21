
function toCMD(data) {
    const _data = [3, '{']

    let k = 0

    const forData = (__data) => {
        k++

        for (const __dat in __data) {
            _data.push(0)
            for (let i = 0; i < 4 * k; i++) if (i != 0 && i % 4 == 0) { _data.push([4, ['grey', '|']]) } else _data.push(3)

            _data.push(__dat)

            if (typeof __data[__dat] === 'object' && !Array.isArray(__data[__dat]) && __data[__dat] !== null) {
                _data.push(' {')
                forData(__data[__dat])

                continue
            }

            _data.push(': ')
            _data.push(JSON.stringify(__data[__dat]))
        }

        k--
        _data.push(0)
        for (let i = 0; i < 4 * k; i++) if (i != 0 && i % 4 == 0) { _data.push([4, ['grey', '|']]) } else _data.push(3)
        _data.push('}')

        return
    }
    forData(data)

    return _data
}

export {
    toCMD
}