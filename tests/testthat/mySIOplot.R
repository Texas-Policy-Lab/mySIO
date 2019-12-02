context("mySIOwidget")

test_that("mySIO widget gets created", {

  dat <- data.frame(
    level1 = rep(c("about a very young person", "better get back to basics"), each=3),
    level2 = paste0(rep(c("a", "b"), each=3), 1:3),
    size = c(10,5,2,3,8,6),
    stringsAsFactors = FALSE
  )

  tree <- d3_nest(dat, value_cols = 'size')

  g <- mySIO(data = tree, categories =  c("a", "b", dat$level2), grouper = "mine", width = "650px")

  expect_is(g, "mySIO")
})
