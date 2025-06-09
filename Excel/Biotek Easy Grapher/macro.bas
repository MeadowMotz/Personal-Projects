Attribute VB_Name = "PlotData"
Sub PlotData()
'
' PlotData Macro
'
    
    Dim details As Range
    Dim cell As Range
    Dim reads As Integer
    Dim table As Range
    Dim area As Range
    Dim i As Integer
    Dim j As Integer
    Dim output As Worksheet
    Dim contents As String
    Dim words() As String
    Dim userInput As String
    Dim ws As Worksheet
    Set ws = ActiveSheet
    Set output = Worksheets.Add
    
    userInput = InputBox("Please enter a name for the new sheet:", "Input Needed")
    output.Name = userInput
    
    ' Find details section & extract reads
    For Each cell In ws.Range("A1:A2000")
        If LCase(cell.Value) = "procedure details" Then
            Set details = cell
        End If
        If LCase(cell.Value) = "start kinetic" Then
            contents = ws.Cells(cell.Row, cell.Column + 1).Value
            words = Split(contents, " ")
            reads = CInt(words(5))
            Exit For
        End If
    Next cell
    
    ' Find table
    For Each cell In ws.Range("B1:B2000")
        If LCase(Trim(cell.Value)) = "time" Then
            Set table = cell
            Exit For
        End If
    Next cell
    
    ' Validate table found
    If table Is Nothing Then
        MsgBox "(Reads: " & readsD & "). ERROR: Table not found! Check column B for 'time'"
        Exit Sub
    End If
    
    ' Validate reads found
    If reads = 0 Then
        MsgBox "ERROR: Reads value not set correctly!"
        Exit Sub
    End If
    
    ' Copy table to new page
    ws.Range(table, ws.Cells(table.Row + reads, table.Column + 97)).Copy _
        Destination:=output.Range("A1")
    Set area = output.Cells(1 + reads + 5, 1)
    Set table = output.Range(output.Cells(1, 1), output.Cells(1 + reads, 1 + 97))
    output.Activate
    
    ' Copy time columns
    For i = 1 To 12
        Range(Cells(1, 1), Cells(reads + 1, 2)).Copy Destination:=Cells(1 + (reads + 2) * i, 1)
    Next i
    
    ' Copy plate columns to appropriate sections
    For Each cell In Range(Cells(1, 3), Cells(1, 98))
        Dim num As Integer
        Dim destRow As Long
        Dim destCol As Long
        Dim outputRow As Long
        
        num = CInt(Mid(cell.Value, 2))
        
        outputRow = reads + 3 + (reads + 2) * (num - 1)
        
        ' Find the next empty column in outputRow, starting from column 3
        destCol = 3
        Do While Not IsEmpty(output.Cells(outputRow, destCol))
            destCol = destCol + 1
        Loop
        
        ' Cut and paste
        Range(cell, Cells(cell.Row + reads, cell.Column)).Cut _
            Destination:=output.Cells(outputRow, destCol)
    Next cell
        
    ' Avg & std dev calc
    For i = 1 To 12
        Cells(1 + (reads + 2) * i, 11).Value = "Avg"
        Cells(1 + (reads + 2) * i, 12).Value = "Std Dev"
        For j = 1 To reads
            If Not RangeHasBlanks(Range(Cells(1 + (reads + 2) * i + j, 3), Cells(1 + (reads + 2) * i + j, 10))) Then
                ' Avg
                Cells(1 + (reads + 2) * i + j, 11).Value = WorksheetFunction.Average(Range(Cells(1 + (reads + 2) * i + j, 3), Cells(1 + (reads + 2) * i + j, 10)))
                ' Std Dev
                Cells(1 + (reads + 2) * i + j, 12).Value = WorksheetFunction.StDev(Range(Cells(1 + (reads + 2) * i + j, 3), Cells(1 + (reads + 2) * i + j, 10)))
            End If
        Next j
    Next i
    
    ' Graphs
    For i = 1 To 12
        Set area = Cells(2 + (reads + 2) * i, 14)
        
        Dim chartShape As Shape
        Dim graph As Chart
        Set chartShape = ActiveSheet.Shapes.AddChart2(240, xlXYScatter)
        Set graph = chartShape.Chart
        
        ' Plot avg
        graph.SetSourceData Source:=Range(Cells(2 + (reads + 2) * i, 11), Cells(2 + (reads + 2) * i + reads, 11))
        
        ' Position the chart on area
        chartShape.Top = area.Top
        chartShape.Left = area.Left
        

        graph.FullSeriesCollection(1).Trendlines.Add Type:=xlLinear, Forward _
            :=0, Backward:=0, DisplayEquation:=1, DisplayRSquared:=1, Name:= _
            "Linear Reg"
        graph.ChartTitle.Text = i
        graph.SetElement (msoElementPrimaryCategoryAxisTitleAdjacentToAxis)
        graph.SetElement (msoElementPrimaryValueAxisTitleAdjacentToAxis)
        graph.Axes(1).AxisTitle.Text = "Time"
        graph.FullSeriesCollection(1).Trendlines(1).DataLabel.Left = 245
        graph.FullSeriesCollection(1).Trendlines(1).DataLabel.Top = 40
    Next i
    
    ' Delete extra label rows
    For i = 1 To reads + 2
        Rows(1).Delete
    Next i
'
End Sub

Function RangeHasBlanks(rng As Range) As Boolean
    Dim cell As Range
    For Each cell In rng
        If IsEmpty(cell.Value) Or cell.Value = "" Then
            RangeHasBlanks = True
            Exit Function
        End If
    Next cell
    RangeHasBlanks = False
End Function


