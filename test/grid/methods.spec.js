import { expect } from 'chai'
import sinon from 'sinon'
import { isObject } from 'axis.js'

import HexFactory from '../../src/hex'
import * as methods from '../../src/grid/methods'

const Hex = HexFactory()
let isObjectSpy

before(function() {
    isObjectSpy = sinon.spy(isObject)
})

describe('pointToHex', function() {
    let Point, isPointy, hexResult, Hex, round, pointToHex, point

    beforeEach(function() {
        Point = sinon.stub().callsFake(point => point)
        isPointy = sinon.stub()
        round = sinon.stub().returns('round result')
        hexResult = {
            size: 1,
            isPointy,
            round
        }
        Hex = sinon.stub().returns(hexResult)
        pointToHex = methods.pointToHexFactory({ Point, Hex })
        point = { x: 1, y: 1 }
    })

    it('calls Hex to access its size and isPointy', function() {
        pointToHex(point)
        expect(Hex).to.have.been.called
    })

    it('calls Point with the passed point to convert it to an actual point', function() {
        pointToHex(point)
        expect(Point).to.have.been.calledWith(point)
    })

    describe('when the hex has a pointy orientation', function() {
        beforeEach(function() {
            isPointy.returns(true)
        })

        it('creates a new hex', function() {
            pointToHex(point)
            expect(Hex.secondCall.args[0]).to.be.closeTo(0.2440, 0.0005)
            expect(Hex.secondCall.args[1]).to.be.closeTo(0.6667, 0.0005)
        })
    })

    describe('when the hex has a flat orientation', function() {
        beforeEach(function() {
            isPointy.returns(false)
        })

        it('creates a new hex', function() {
            pointToHex(point)
            expect(Hex.secondCall.args[0]).to.be.closeTo(0.6667, 0.0005)
            expect(Hex.secondCall.args[1]).to.be.closeTo(0.2440, 0.0005)
        })
    })

    it('rounds that hex', function() {
        pointToHex(point)
        expect(round).to.have.been.called
    })

    it('returns the hex', function() {
        const result = pointToHex(point)
        expect(result).to.equal('round result')
    })
})

describe('hexToPoint', function() {
    it('converts a hex to a point by calling the passed hex toPoint() method', function() {
        const hex = Hex()

        sinon.spy(hex, 'toPoint')

        methods.hexToPoint(hex)
        expect(hex.toPoint).to.have.been.called

        hex.toPoint.restore()
    })
})

describe('colSize', function() {
    const isPointy = sinon.stub()
    const width = sinon.stub().returns(1)
    const Hex = sinon.stub().returns({ isPointy, width })
    const colSize = methods.colSizeFactory({ Hex })

    it('creates a hex', function() {
        colSize()
        expect(Hex).to.have.been.called
    })

    it('checks if the hex is pointy', function() {
        colSize()
        expect(isPointy).to.have.been.called
    })

    describe('when hexes are pointy', function() {
        before(function() {
            isPointy.returns(true)
        })

        it('returns the hex width', function() {
            const result = colSize()
            expect(width).to.have.been.called
            expect(result).to.equal(1)
        })
    })

    describe('when hexes are not pointy', function() {
        before(function() {
            isPointy.returns(false)
        })

        it('returns 3/4 of the hex width', function() {
            const result = colSize()
            expect(width).to.have.been.called
            expect(result).to.equal(0.75)
        })
    })
})

describe('rowSize', function() {
    const isPointy = sinon.stub()
    const height = sinon.stub().returns(1)
    const Hex = sinon.stub().returns({ isPointy, height })
    const rowSize = methods.rowSizeFactory({ Hex })

    it('creates a hex', function() {
        rowSize()
        expect(Hex).to.have.been.called
    })

    it('checks if the hex is pointy', function() {
        rowSize()
        expect(isPointy).to.have.been.called
    })

    describe('when hexes are pointy', function() {
        before(function() {
            isPointy.returns(true)
        })

        it('returns 3/4 of the hex height', function() {
            const result = rowSize()
            expect(height).to.have.been.called
            expect(result).to.equal(0.75)
        })
    })

    describe('when hexes are not pointy', function() {
        before(function() {
            isPointy.returns(false)
        })

        it('returns the hex height', function() {
            const result = rowSize()
            expect(height).to.have.been.called
            expect(result).to.equal(1)
        })
    })
})

describe('parallelogram', function() {
    let parallelogram

    before(function() {
        parallelogram = methods.parallelogramFactory({ Hex, isObject: isObjectSpy })
    })

    it('returns an array with a length of (width ⨉ height) hexes', function() {
        const result = parallelogram({ width: 2, height: 3 })
        expect(result).to.be.an('array')
        expect(result).to.have.a.lengthOf(6)
    })

    describe('when called without start hex or direction', function() {
        it('returns the hexes in a parallelogram shape, starting at Hex(0)', function() {
            const coordinates = parallelogram({ width: 2, height: 2 }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 0, z: -1 },
                { x: 0, y: 1, z: -1 },
                { x: 1, y: 1, z: -2 }
            ])
        })
    })

    describe('when called with start hex', function() {
        it('returns the hexes in a parallelogram shape, starting at the given start hex', function() {
            const coordinates = parallelogram({
                width: 2,
                height: 2,
                start: Hex(5, 4)
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 5, y: 4, z: -9 },
                { x: 6, y: 4, z: -10 },
                { x: 5, y: 5, z: -10 },
                { x: 6, y: 5, z: -11 }
            ])
        })
    })

    describe('when called with direction 1', function() {
        it('returns the hexes in a parallelogram shape, in a southeastern direction', function() {
            const coordinates = parallelogram({
                width: 2,
                height: 2,
                direction: 1
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 0, z: -1 },
                { x: 0, y: 1, z: -1 },
                { x: 1, y: 1, z: -2 }
            ])
        })
    })

    describe('when called with direction 3', function() {
        it('returns the hexes in a parallelogram shape, in a southwestern direction', function() {
            const coordinates = parallelogram({
                width: 2,
                height: 2,
                direction: 3
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: -1, y: 0, z: 1 },
                { x: -1, y: 1, z: 0 },
                { x: -2, y: 1, z: 1 }
            ])
        })
    })

    describe('when called with direction 5', function() {
        it('returns the hexes in a parallelogram shape, in a northern direction', function() {
            const coordinates = parallelogram({
                width: 2,
                height: 2,
                direction: 5
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: 1, y: -1, z: 0 },
                { x: 0, y: -1, z: 1 },
                { x: 1, y: -2, z: 1 }
            ])
        })
    })
})

describe('triangle', function() {
    let triangle

    before(function() {
        triangle = methods.triangleFactory({ Hex, isObject: isObjectSpy })
    })

    // https://en.wikipedia.org/wiki/Triangular_number
    it('returns an array with a length of the triangular number of the size', function() {
        const result = triangle({ size: 4 })
        expect(result).to.be.an('array')
        expect(result).to.have.a.lengthOf(4+3+2+1)
    })

    describe('when called without start hex or direction', function() {
        it('returns the hexes in a triangle shape, starting at Hex(0)', function() {
            const coordinates = triangle({ size: 2 }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 1, z: -1 },
                { x: 1, y: 0, z: -1 }
            ])
        })
    })

    describe('when called with start hex', function() {
        it('returns the hexes in a triangle shape, starting at the given start hex', function() {
            const coordinates = triangle({
                size: 2,
                start: Hex(3, 6)
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 3, y: 6, z: -9 },
                { x: 3, y: 7, z: -10 },
                { x: 4, y: 6, z: -10 }
            ])
        })
    })

    describe('when called with direction 1', function() {
        it('returns the hexes in a triangle shape, pointing down', function() {
            const coordinates = triangle({
                size: 2,
                direction: 1
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 1, z: -1 },
                { x: 1, y: 0, z: -1 }
            ])
        })
    })

    describe('when called with direction 5', function() {
        it('returns the hexes in a triangle shape, pointing up', function() {
            const coordinates = triangle({
                size: 2,
                direction: 5
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: 2, z: -2 },
                { x: 1, y: 1, z: -2 },
                { x: 1, y: 2, z: -3 }
            ])
        })
    })
})

describe('hexagon', function() {
    let hexagon

    before(function() {
        hexagon = methods.hexagonFactory({ Hex, isObject: isObjectSpy })
    })

    it('returns an array with a hard to determine amount of hexes 😬', function() {
        const result = hexagon({ radius: 4 })
        expect(result).to.be.an('array')
        expect(result).to.have.a.lengthOf(37)
    })

    describe('when called without center hex', function() {
        it('returns the hexes in a hexagon shape, with its center at Hex(0)', function() {
            const coordinates = hexagon({ radius: 2 }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 0, y: -1, z: 1 },
                { x: 1, y: -1, z: 0 },
                { x: -1, y: 0, z: 1 },
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 0, z: -1 },
                { x: -1, y: 1, z: 0 },
                { x: 0, y: 1, z: -1 }
            ])
        })
    })

    describe('when called with center hex', function() {
        it('returns the hexes in a hexagon shape, with its center at the given center hex', function() {
            const coordinates = hexagon({
                radius: 2,
                center: Hex(3, 1)
            }).map(hex => hex.coordinates())
            expect(coordinates).to.deep.include.members([
                { x: 3, y: 0, z: -3 },
                { x: 4, y: 0, z: -4 },
                { x: 2, y: 1, z: -3 },
                { x: 3, y: 1, z: -4 },
                { x: 4, y: 1, z: -5 },
                { x: 2, y: 2, z: -4 },
                { x: 3, y: 2, z: -5 }
            ])
        })
    })
})

describe('rectangle', function() {
    let rectangle, Hex

    before(function() {
        rectangle = methods.rectangleFactory({ Hex: HexFactory(), isObject: isObjectSpy })
    })

    it('returns an array with a length of (width ⨉ height) hexes', function() {
        const result = rectangle({ width: 4, height: 5 })
        expect(result).to.be.an('array')
        expect(result).to.have.a.lengthOf(20)
    })

    describe('when hexes have a pointy orientation', function() {
        before(function() {
            Hex = HexFactory({ orientation: 'POINTY' })
            rectangle = methods.rectangleFactory({ Hex , isObject: isObjectSpy })
        })

        describe('when called without start hex or direction', function() {
            it('returns the hexes in a rectangle shape, starting at Hex(0)', function() {
                const coordinates = rectangle({ width: 2, height: 3 }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: -1 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 1, z: -2 },
                    { x: -1, y: 2, z: -1 },
                    { x: 0, y: 2, z: -2 }
                ])
            })
        })

        describe('when called with start hex', function() {
            it('returns the hexes in a rectangle shape, starting at the given start hex', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 3,
                    start: Hex(-4, -2)
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: -4, y: -2, z: 6 },
                    { x: -3, y: -2, z: 5 },
                    { x: -4, y: -1, z: 5 },
                    { x: -3, y: -1, z: 4 },
                    { x: -5, y: 0, z: 5 },
                    { x: -4, y: 0, z: 4 }
                ])
            })
        })

        describe('when called with direction 0', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 0
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: -1 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 1, z: -2 }
                ])
            })
        })

        describe('when called with direction 1', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 1
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 0, z: -1 },
                    { x: 1, y: 1, z: -2 }
                ])
            })
        })

        describe('when called with direction 2', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 2
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: -1, y: 1, z: 0 },
                    { x: -1, y: 0, z: 1 },
                    { x: -2, y: 1, z: 1 }
                ])
            })
        })

        describe('when called with direction 3', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 3
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: -1, y: 0, z: 1 },
                    { x: -1, y: 1, z: 0 },
                    { x: -2, y: 1, z: 1 }
                ])
            })
        })

        describe('when called with direction 4', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 4
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 0, y: -1, z: 1 },
                    { x: 1, y: -1, z: 0 },
                    { x: 1, y: -2, z: 1 }
                ])
            })
        })

        describe('when called with direction 5', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 5
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: -1, z: 0 },
                    { x: 0, y: -1, z: 1 },
                    { x: 1, y: -2, z: 1 }
                ])
            })
        })
    })

    describe('when hexes have a flat orientation', function() {
        before(function() {
            Hex = HexFactory({ orientation: 'FLAT' })
            rectangle = methods.rectangleFactory({ Hex, isObject: isObjectSpy })
        })

        describe('when called without start hex or direction', function() {
            it('returns the hexes in a rectangle shape, starting at Hex(0)', function() {
                const coordinates = rectangle({ width: 2, height: 3 }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: -1 },
                    { x: 2, y: 0, z: -2 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 1, z: -2 },
                    { x: 2, y: 1, z: -3 }
                ])
            })
        })

        describe('when called with start hex', function() {
            it('returns the hexes in a rectangle shape, starting at the given start hex', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 3,
                    start: Hex(-4, -2)
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: -4, y: -2, z: 6 },
                    { x: -3, y: -2, z: 5 },
                    { x: -2, y: -2, z: 4 },
                    { x: -4, y: -1, z: 5 },
                    { x: -3, y: -1, z: 4 },
                    { x: -2, y: -1, z: 3 }
                ])
            })
        })

        describe('when called with direction 0', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 0
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: -1 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 1, z: -2 }
                ])
            })
        })

        describe('when called with direction 1', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 1
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 0, y: 1, z: -1 },
                    { x: 1, y: 0, z: -1 },
                    { x: 1, y: 1, z: -2 }
                ])
            })
        })

        describe('when called with direction 2', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 2
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: -1, y: 1, z: 0 },
                    { x: -1, y: 0, z: 1 },
                    { x: -2, y: 1, z: 1 }
                ])
            })
        })

        describe('when called with direction 3', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 3
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: -1, y: 0, z: 1 },
                    { x: -1, y: 1, z: 0 },
                    { x: -2, y: 1, z: 1 }
                ])
            })
        })

        describe('when called with direction 4', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 4
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 0, y: -1, z: 1 },
                    { x: 1, y: -1, z: 0 },
                    { x: 1, y: -2, z: 1 }
                ])
            })
        })

        describe('when called with direction 5', function() {
            it('returns the hexes in a rectangle shape, in an eastern direction', function() {
                const coordinates = rectangle({
                    width: 2,
                    height: 2,
                    direction: 5
                }).map(hex => hex.coordinates())
                expect(coordinates).to.deep.include.members([
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: -1, z: 0 },
                    { x: 0, y: -1, z: 1 },
                    { x: 1, y: -2, z: 1 }
                ])
            })
        })
    })
})
