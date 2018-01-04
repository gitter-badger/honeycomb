import { expect } from 'chai'
import sinon from 'sinon'

import createGridFactoryFactory from '../../src/grid'
import createHexFactory from '../../src/hex'

describe('Grid.createFactory', function() {
    describe('when not passed a function', function() {
        it('calls Honeycomb.Hex.createFactory() to create a default Hex factory', function() {
            const createHexFactorySpy = sinon.spy()
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
    let GridFactory, Grid

    beforeEach(function() {
        GridFactory = createGridFactoryFactory({ createHexFactory })
        Grid = GridFactory()
    })

    it('returns an empty object', function() {
        expect(Grid()).to.be.empty
    })

    it('has Grid methods in its prototype', function() {
        const HexSpy = sinon.spy()
        const Grid = GridFactory(HexSpy)
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

    describe('find', function() {
        it('accepts a function and returns a copy of the first hex in the grid for which that function returns truthy', function() {
            const grid = Grid().rectangle({ width: 2, height: 1 })
            const Hex = grid.Hex
            const predicate = sinon.stub().onSecondCall().returns(true)
            const result = grid.find(predicate)

            expect(predicate.callCount).to.equal(2)
            expect(predicate).to.have.been.calledWith(Hex())
            expect(predicate).to.have.been.calledWith(Hex(1, 0))
            expect(result).not.to.equal(grid['{ x: 1, y: 0, z: -1 }'])
            expect(result).to.eql(Hex(1, 0))
        })
    })

    describe('filter', function() {
        it('accepts a function and returns a new grid with only the copies of hexes for which the function returns truthy', function() {
            const grid = Grid().rectangle({ width: 2, height: 2 })
            const Hex = grid.Hex
            const predicate = sinon.stub()
                .onSecondCall().returns(true)
                .onThirdCall().returns(true)
            const result = grid.filter(predicate)

            expect(predicate.callCount).to.equal(4)
            expect(predicate).to.have.been.calledWith(Hex())
            expect(predicate).to.have.been.calledWith(Hex(1, 0))
            expect(predicate).to.have.been.calledWith(Hex(0, 1))
            expect(predicate).to.have.been.calledWith(Hex(1, 1))
            // duck typing to test it's a grid
            expect(result).to.respondTo('hexToPoint')
            expect(result).to.have.property(Hex(1, 0).toString()).that.eqls(Hex(1, 0))
            expect(result).to.have.property(Hex(0, 1).toString()).that.eqls(Hex(0, 1))
        })
    })
})
