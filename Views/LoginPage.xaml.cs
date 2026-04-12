using MauiApp1.Services;
using MauiApp1.ViewModels;

namespace MauiApp1.Views;

public partial class LoginPage : ContentPage
{
    private readonly INavigationService _nav;

    public LoginPage(LoginViewModel viewModel, INavigationService nav)
    {
        InitializeComponent();
        BindingContext = viewModel;
        _nav = nav;
    }

    private void OnCloseClicked(object sender, EventArgs e)
    {
        _ = _nav.PopModalAsync();
    }
}
