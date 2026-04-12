using MauiApp1.ViewModels;

namespace MauiApp1.Views;

public partial class OwnerToolsPage : ContentPage
{
    public OwnerToolsPage(OwnerSubmitViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
