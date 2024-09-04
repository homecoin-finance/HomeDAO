import pytest
import brownie


@pytest.fixture(scope="module", autouse=True)
def pooldeploy(PoolTest15, a):
    p = a[0].deploy(PoolTest15)
    yield p

@pytest.fixture(scope="module", autouse=True)
def curve(CurveMock0, a):
    c = a[0].deploy(CurveMock0)
    yield c

@pytest.fixture(scope="module", autouse=True)
def proptoken(PropToken0, pooldeploy, a):
    t = a[0].deploy(PropToken0)
    t.initialize('PropToken', 'TOKEN', pooldeploy.address, a[0].address)
    yield t

@pytest.fixture(scope="module", autouse=True)
def pool(LTVGuidelines, proptoken, pooldeploy, curve, a):
    l = a[0].deploy(LTVGuidelines);
    pooldeploy.setAddressesForTest(a[1].address, a[2].address, proptoken.address, l.address);
    yield pooldeploy

@pytest.fixture(autouse=True)
def isolation(fn_isolation):
    pass


def make_loan(proptoken, pool, amount, rate, address):
    token = proptoken.getPropTokenCount()

    proptoken.mintPropToken(address, amount * 2, [], amount * 4, '', '')
    proptoken.approve(pool.address, token, {'from': address})

    pool.borrow(amount, rate, token, {'from': address})

    return token


def test_borrow_repay(pool, proptoken, curve, a, chain):
    token_0 = make_loan(proptoken, pool, 50_000_000000, 3_600000, a[0].address)

    assert pool.getLoanDetails(0)[3] == 50_000_000000
    assert pool.getLoanDetails(0)[4] == 0

    assert pool.balanceOf(a[0].address) == 49_500_000000
    assert pool.balanceOf(a[1].address) == 250_000000
    assert pool.balanceOf(a[2].address) == 250_000000

    assert pool.totalSupply() == 50_000_000000

    assert proptoken.ownerOf(0) == pool.address

    chain.sleep(60*60*24) # 1 day
    pool.repay(0, 9_500_000000, {'from': a[0].address})

    assert pool.balanceOf(a[0].address) == 40_000_000000
    assert pool.balanceOf(a[1].address) > 250_000000
    assert pool.balanceOf(a[2].address) > 250_000000

    assert pool.totalSupply() == pool.getLoanDetails(0)[3]

    token_1 = make_loan(proptoken, pool, 50_000_000000, 3_600000, a[0].address)

    chain.sleep(60*60*24*30) # 30 days
    pool.repay(0, 50_000_000000, {'from': a[0].address}) # pay off the loan

    assert pool.getLoanDetails(0)[3] == 0
    assert pool.getLoanDetails(0)[4] == 0

    assert pool.totalSupply() == 50_000_000000


def test_too_small_rate(pool, proptoken, curve, a, chain):
    with brownie.reverts("rate must not be less than 1%"):
        token_0 = make_loan(proptoken, pool, 45_000_000000, 9, a[0].address)

    token_0 = make_loan(proptoken, pool, 45_000_000000, 9_000000, a[0].address)
    token_1 = make_loan(proptoken, pool, 45_000_000000, 9_000000, a[0].address)

    pool.changeRate(0, 9)

    assert pool.getLoanDetails(0)[2] == 9
    assert pool.getLoanDetails(1)[2] == 9_000000

    assert pool.balanceOf(a[0].address) == 89_100_000000

    chain.sleep(60*60*24) # 1 day
    pool.repay(0, 46_000_000000, {'from': a[0].address})
