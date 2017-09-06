.PHONY: test clean readme

.DEFAULT_GOAL:=help

build: ## Babel transpiles files from _./src_ to _./lib_.
	@printf "Transpiling files from ./src to ./lib (babel)...\n"
	npm run build

install: ## Installs all modules
	@printf "Install all modules...\n"
	npm install

clean: ## Removes generated files in folders ./node_modules, ./lib and ./coverage"
	@printf "Removing ./lib, ./node_modules, ./lib and ./coverage...\n"
	rm -rf lib
	rm -rf node_modules
	rm -rf coverage

test: ## Runs the test suite and ESLint.
	@printf "Running test suite and ESLint...\n"
	npm test
	npm run eslint

eslint: ## Runs ESLint.
	@printf "Running ESLint...\n"
	npm run eslint

help: ## Prints the help about targets.
	@printf "Usage:    make [\033[34mtarget\033[0m]\n"
	@printf "Default:  \033[34m%s\033[0m\n" $(.DEFAULT_GOAL)
	@printf "Targets:\n"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf " \033[34m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort
