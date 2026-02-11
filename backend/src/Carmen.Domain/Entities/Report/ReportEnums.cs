namespace Carmen.Domain.Entities.Report;

public enum DataSourceType
{
    GeneralLedger = 0,
    AccountsPayable = 1,
    AccountsReceivable = 2,
    AssetManagement = 3,
}

public enum OutputFormat
{
    Pdf = 0,
    Excel = 1,
}

public enum AggregateFunction
{
    None = 0,
    Sum = 1,
    Count = 2,
    Average = 3,
    Min = 4,
    Max = 5,
}

public enum FilterOperator
{
    Equals = 0,
    NotEquals = 1,
    Contains = 2,
    StartsWith = 3,
    EndsWith = 4,
    GreaterThan = 5,
    GreaterThanOrEqual = 6,
    LessThan = 7,
    LessThanOrEqual = 8,
    Between = 9,
    In = 10,
    IsNull = 11,
    IsNotNull = 12,
}

public enum SortDirection
{
    Ascending = 0,
    Descending = 1,
}

public enum ColumnType
{
    Text = 0,
    Number = 1,
    Currency = 2,
    Date = 3,
    Boolean = 4,
    Percentage = 5,
}

public enum ScheduleFrequency
{
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Quarterly = 3,
    Yearly = 4,
}

public enum PageOrientation
{
    Portrait = 0,
    Landscape = 1,
}
