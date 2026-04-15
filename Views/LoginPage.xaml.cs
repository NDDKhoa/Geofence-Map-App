using MauiApp1.Services;
using MauiApp1.ViewModels;
using Microsoft.Extensions.DependencyInjection;

namespace MauiApp1.Views;

public partial class LoginPage : ContentPage
{
    private readonly INavigationService _nav;
    private readonly IServiceProvider _services;

    public LoginPage(LoginViewModel viewModel, INavigationService nav, IServiceProvider services)
    {
        InitializeComponent();
        BindingContext = viewModel;
        _nav = nav;
        _services = services;
    }

    private async void OnOpenRegisterClicked(object sender, EventArgs e)
    {
        var page = _services.GetRequiredService<RegisterPage>();
        await Navigation.PushAsync(page);
    }

    private void OnCloseClicked(object sender, EventArgs e)
    {
        if (global::Microsoft.Maui.Controls.Application.Current?.MainPage is NavigationPage nav)
        {
            if (nav.Navigation.NavigationStack.Count > 1)
            {
                _ = nav.PopAsync();
                return;
            }

            if (nav.CurrentPage is LoginPage)
            {
                global::Microsoft.Maui.Controls.Application.Current?.Quit();
                return;
            }
        }

        _ = _nav.PopModalAsync();
    }
}
