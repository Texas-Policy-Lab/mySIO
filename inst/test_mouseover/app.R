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
                shinydashboard::box(mySIOOutput("first", width = "400px"))),
         column(6,
                shinydashboard::box(mySIOOutput("second"))),
         verbatimTextOutput("first_seq")
      )
   )
)

# Define server logic required to draw a histogram
server <- function(input, output) {

   output$first <- renderMySIO({
     dat <- data.frame(
       level1 = rep(c("about a very young person", "better get back to basics"), each=4),
       level2 = paste0(rep(c("a", "b"), each = 4), 1:2),
       level3 = paste0(rep(c("a", "b"), each = 4), 1:4),
       size = rnorm(8, mean = 5, sd = 0.5) * input$bins * c(10,5,2,3,8,6,7,9),
       stringsAsFactors = FALSE
     )

     tree <- d3_nest(dat, value_cols = 'size')
     mySIO(data = tree, categories =  c("a", "b", dat$level2, dat$level3), grouper = "mine", width = "650px")
   })

   output$second <- renderMySIO({
     dat <- data.frame(
       level1 = rep(c("about a very young person", "better get back to basics"), each=4),
       level2 = paste0(rep(c("a", "b"), each = 4), 1:4),
       level3 = paste0(rep(c("a", "b"), each = 4), 1:4),
       size = rnorm(8, mean = 4, sd = 0.5) * input$bins * c(13,2,6,8,1,3,8,12),
       stringsAsFactors = FALSE
     )

     tree <- d3_nest(dat, value_cols = 'size')
     mySIO(data = tree, categories =  c("a", "b", dat$level2, dat$level3), grouper = "notmine",width = "650px")
   })

   observeEvent(input$first_sequence,{
     output$first_seq <- renderText({
       input$first_data
     })
   })
}

# Run the application
shinyApp(ui = ui, server = server)

