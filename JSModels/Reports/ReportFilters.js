"use strict";

class ReportFilters {
    constructor() {
        this.ReportFilterID = 0;
        this.ReportDefinitionId = 0;
        this.ReportDefinitionToReportFilterId = 0;
        this.FilterOrderNumber = 0;

        this.StoredProcedureFilterName = '';
        this.FilterParameterName = '';
        this.TableName = '';
        this.IdColumnName = '';

        this.IsHidden = false;
        this.TypeName = '';
        this.FilterType = '';
        this.SpecificSQLStatement = '';

        this.ParamID = 0;
        this.ParamName = '';
        this.ParamType = '';
        this.ParamTypeName = '';

        this.ReportFilterStatus = 0;
        this.FilterStatusMessage = "";


    }
}