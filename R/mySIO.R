#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
mySIO <- function(data, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
   data = data,
   options = options
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'mySIO',
    x,
    width = width,
    height = height,
    package = 'mySIO',
    elementId = elementId
  )
}

#' Shiny bindings for mySIO
#'
#' Output and render functions for using mySIO within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a mySIO
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name mySIO-shiny
#'
#' @export
mySIOOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'mySIO', width, height, package = 'mySIO')
}

#' @rdname mySIO-shiny
#' @export
renderMySIO <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, mySIOOutput, env, quoted = TRUE)
}
