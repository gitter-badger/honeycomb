import { expect } from 'chai'
import sinon from 'sinon'

import createGridFactoryFactory from '../../src/grid'
import createHexFactory from '../../src/hex'

describe('Grid.createFactory', function() {
    describe('when not passed a function', function() {
        it(`calls Honeycomb.Hex.createFactory() to create a default Hex factory`, function() {
            const createHexFactorySpy = sinon.spy(createHexFactory)
            const createGridFactory = createGridFactoryFactory({ createHexFactory: createHexFactorySpy })
            createGridFactory()
            expect(createHexFactorySpy).to.have.been.called
        })
    })

    it('returns a Grid factory', function() {
        const createGridFactory = createGridFactoryFactory({ createHexFactory })
        const Grid = createGridFactory()
        expect(Grid).to.be.a('function')
    })
})

describe('Grid', function() {
    let Grid, Hex

    beforeEach(function() {
        Hex = createHexFactory()
        Grid = createGridFactoryFactory({ createHexFactory })(Hex)
    })

    it('returns an empty object', function() {
        expect(Grid()).to.be.empty
    })

    it('has Grid methods in its prototype', function() {
        const prototype = Object.getPrototypeOf(Grid())
        const prototypeProps = Object.keys(prototype)

        expect(prototypeProps).to.eql([
            'Hex',
            'pointToHex',
            'hexToPoint',
            'colSize',
            'rowSize',
            'parallelogram',
            'triangle',
            'hexagon',
            'rectangle',
            'find',
            'filter',
            'forEach',
            'map',
            'reduce'
        ])
        expect(prototype).to.have.property('Hex', HexSpy)
    })
})
