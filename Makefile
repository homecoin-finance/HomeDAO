DC := docker-compose

init:
	find .git/hooks -type l -exec rm {} \;
	find .githooks -type f -exec ln -sf ../../{} .git/hooks/ \;

git-hooks:
	@git config core.hooksPath .githooks

update-latest-contracts:
	node scripts/updateLatestContracts.js

check-latest-contracts:
	node scripts/updateLatestContracts.js check

install:
	yarn install

compile:
	truffle compile --all

test-contracts:
	truffle compile --all
	truffle test

test-contracts-ci:
	${DC} run --rm truffle bash -c "make install && make test-contracts"

test-contracts-no-migrate:
	truffle test --bail --network testing

prettier:
	cd frontend/src; prettier --write *.js state store components pages utils


DEPLOY_NETWORK :=
SKIP_DRY_RUN := --dry-run
DEPLOY_ARGS :=
ifdef DEPLOY_TO
	DEPLOY_ARGS := --to ${DEPLOY_TO}
endif
ifdef DEPLOY_FROM
	DEPLOY_ARGS := $(DEPLOY_ARGS) --f ${DEPLOY_FROM}
endif
deploy:
	LOCAL_ONLY=false truffle migrate --network ${DEPLOY_NETWORK} ${SKIP_DRY_RUN} ${DEPLOY_ARGS}


VERIFY_CONTRACT := 
verify:
ifndef ETHERSCAN_API_KEY
	$(error ETHERSCAN_API_KEY env var is not set)
endif
ifndef VERIFY_CONTRACT
	$(error VERIFY_CONTRACT is not set)
endif
ifndef DEPLOY_NETWORK
	$(error DEPLOY_NETWORK is not set)
endif
	LOCAL_ONLY=false truffle run verify ${VERIFY_CONTRACT} --network ${DEPLOY_NETWORK}

truffle-shell:
	${DC} exec truffle bash

save-deployments:
	python3 scripts/deployments.py save

restore-deployments:
	python3 scripts/deployments.py restore

clean-brownie:
	rm -r build/deployments
