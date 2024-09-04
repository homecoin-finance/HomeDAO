import pytest
import brownie


@pytest.fixture(scope="module", autouse=True)
def coin(RealWorldAsset, a):
    p = a[0].deploy(RealWorldAsset, a[1])
    yield p

@pytest.fixture(scope="module", autouse=True)
def airdrop(LSAirdrop, a):
    p = a[0].deploy(LSAirdrop, a[0])
    yield p

def test_airdrop_coin(coin, airdrop, a, chain):
    assert coin.balanceOf(a[0]) == 0
    assert coin.balanceOf(a[3]) == 0
    assert coin.balanceOf(a[4]) == 0

    coin.mint(airdrop.address, 100000000, {'from': a[1]})
    airdrop.airdrop(coin.address, [a[3], a[4]], [300, 400])

    assert coin.balanceOf(a[0]) == 0
    assert coin.balanceOf(a[3]) == 300
    assert coin.balanceOf(a[4]) == 400

def test_simple_coin(coin, airdrop, a, chain):
    with brownie.reverts("Ownable: caller is not the owner"):
        coin.mint(a[0], 100)

    coin.mint(a[2], 100, {'from': a[1]})

    coin.mint(airdrop.address, 100000000, {'from': a[1]})

    assert coin.balanceOf(a[2]) == 100
    assert coin.balanceOf(a[0]) == 0

    coin.renounceOwnership({'from': a[1]})

    with brownie.reverts("Ownable: caller is not the owner"):
        coin.mint(a[1], 100)
