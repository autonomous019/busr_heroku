REPORTER = dot

    test: 
	  @NODE_ENV=test ./node_modules/.bin/mocha \
	   --reporter $(REPORTER) \
	   
	test-w: 
	   @NODE_ENV=rest ./node_modules/.bin/mocha \
	    --reporter $(REPORTER) \
		--watch
	.PHONY: test test-w
	
	