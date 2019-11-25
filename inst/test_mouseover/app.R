#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(d3r)
library(mySIO)



# Define UI for application that draws a histogram
ui <- fluidPage(

   # Application title
   titlePanel("Old Faithful Geyser Data"),

   # Sidebar with a slider input for number of bins
   sidebarLayout(
      sidebarPanel(
         sliderInput("bins",
                     "Number of bins:",
                     min = 1,
                     max = 50,
                     value = 30)
      ),

      # Show a plot of the generated distribution
      mainPanel(
         column(6,
                mySIOOutput("first")),
         column(6,
                mySIOOutput("second"))
      )
   )
)

# Define server logic required to draw a histogram
server <- function(input, output) {

   output$first <- renderMySIO({
     dat <- data.frame(
       level1 = rep(c("about a very young person", "better get back to basics"), each=3),
       level2 = paste0(rep(c("a", "b"), each=3), 1:3),
       size = c(10,5,2,3,8,6),
       stringsAsFactors = FALSE
     )

     tree <- d3_nest(dat, value_cols = 'size')
     mySIO(data = tree, categories =  c("a", "b", dat$level2), width = "650px")
   })

   output$second <- renderMySIO({
     dat <- data.frame(
       level1 = rep(c("about a very young person", "better get back to basics"), each=3),
       level2 = paste0(rep(c("a", "b"), each=3), 1:3),
       size = c(13,2,6,8,1,3),
       stringsAsFactors = FALSE
     )

     tree <- d3_nest(dat, value_cols = 'size')
     mySIO(data = tree, categories =  c("a", "b", dat$level2), width = "650px")
   })
}

# Run the application
shinyApp(ui = ui, server = server)

